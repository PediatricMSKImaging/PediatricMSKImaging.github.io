import argparse
import datetime
import json
import math
import os
import pathlib
import re
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request


def short_id(value):
    return str(value or '').rstrip('/').rsplit('/', 1)[-1]


def normalize_doi(value):
    if not value:
        return None
    normalized = str(value).strip().lower()
    normalized = re.sub(r'^https?://(?:dx\.)?doi\.org/', '', normalized)
    normalized = re.sub(r'^doi:\s*', '', normalized)
    return normalized if normalized.startswith('10.') else None


def pi_for_author(author, identities):
    author_id = short_id(author.get('id'))
    orcids = {short_id(value) for value in (author.get('observed_orcids') or [])}
    if author.get('orcid'):
        orcids.add(short_id(author['orcid']))
    for pi in identities['pis']:
        if author_id in pi['author_ids'] or pi['orcid'] in orcids:
            return pi['id']
    return None


def canonicalize_works(records, identities):
    parents = list(range(len(records)))

    def root(index):
        while parents[index] != index:
            parents[index] = parents[parents[index]]
            index = parents[index]
        return index

    tokens = {}
    for index, record in enumerate(records):
        work_id = short_id(record.get('id'))
        if not re.fullmatch(r'W\d+', work_id):
            raise ValueError('A work has an invalid OpenAlex ID')
        keys = [('id', work_id)]
        doi = normalize_doi(record.get('doi'))
        if doi:
            keys.append(('doi', doi))
        for key in keys:
            if key in tokens:
                parents[root(index)] = root(tokens[key])
            tokens[key] = index

    groups = {}
    for index, record in enumerate(records):
        groups.setdefault(root(index), []).append(record)

    canonical = []
    for group in groups.values():
        source_ids = sorted({short_id(record['id']) for record in group})
        pi_ids = set()
        authorships = {}
        for record in group:
            pi_ids.update(record.get('_pi_ids', []))
            for authorship in record.get('authorships') or []:
                pi_id = pi_for_author(authorship.get('author') or {}, identities)
                if pi_id:
                    pi_ids.add(pi_id)
                authorships[json.dumps(authorship, sort_keys=True)] = authorship
        if not pi_ids:
            raise ValueError('A retrieved work cannot be associated with a verified PI')
        years = [record['publication_year'] for record in group
                 if isinstance(record.get('publication_year'), int)
                 and not isinstance(record['publication_year'], bool)]
        dois = sorted({normalize_doi(record.get('doi')) for record in group
                       if normalize_doi(record.get('doi'))})
        doi = dois[0] if dois else None
        canonical.append({
            'id': source_ids[0], 'source_ids': source_ids,
            'title': next((record.get('title') for record in group if record.get('title')), 'Untitled work'),
            'year': min(years) if years else None,
            'doi': doi,
            'url': 'https://doi.org/' + urllib.parse.quote(doi, safe='/') if doi
                   else 'https://openalex.org/' + source_ids[0],
            'pi_ids': sorted(pi_ids, key=lambda value: [pi['id'] for pi in identities['pis']].index(value)),
            'authorships': list(authorships.values()),
            '_truncated': any(len(record.get('authorships') or []) >= 100 for record in group),
        })
    return sorted(canonical, key=lambda work: work['id'])


def coordinates(geo):
    latitude, longitude = geo.get('latitude'), geo.get('longitude')
    if all(isinstance(value, (int, float)) and not isinstance(value, bool)
           and math.isfinite(value) for value in (latitude, longitude)):
        if -90 <= latitude <= 90 and -180 <= longitude <= 180:
            return latitude, longitude
    return None, None


def build_snapshot(records, institutions, identities, generated_at):
    works = canonicalize_works(records, identities)
    home_ids = {short_id(value) for value in identities['home_institution_ids']}
    links = {}
    metadata = {}
    without_affiliations = 0
    for work in works:
        linked = set()
        for authorship in work['authorships']:
            if pi_for_author(authorship.get('author') or {}, identities):
                continue
            for institution in authorship.get('institutions') or []:
                institution_id = short_id(institution.get('id'))
                if not institution_id:
                    continue
                if institution_id not in institutions:
                    raise ValueError('Missing institution metadata: ' + institution_id)
                enriched = institutions[institution_id]
                canonical_id = short_id(enriched.get('id')) or institution_id
                lineage = {short_id(value) for value in enriched.get('lineage') or []}
                if home_ids.intersection(lineage | {institution_id, canonical_id}):
                    continue
                linked.add(canonical_id)
                metadata[canonical_id] = enriched
        for institution_id in linked:
            links.setdefault(institution_id, set()).add(work['id'])
        if not linked:
            without_affiliations += 1

    output_institutions = []
    for institution_id, work_ids in sorted(links.items()):
        enriched = metadata[institution_id]
        geo = enriched.get('geo') or {}
        latitude, longitude = coordinates(geo)
        output_institutions.append({
            'id': institution_id, 'name': enriched.get('display_name') or institution_id,
            'city': geo.get('city'), 'country': geo.get('country'),
            'country_code': geo.get('country_code') or enriched.get('country_code'),
            'latitude': latitude, 'longitude': longitude, 'work_ids': sorted(work_ids),
        })
    snapshot = {
        'schema_version': 1, 'generated_at': generated_at, 'pis': identities['pis'],
        'works': [{key: value for key, value in work.items()
                   if key not in ('authorships', '_truncated')} for work in works],
        'institutions': output_institutions,
        'coverage': {
            'truncated_authorship_works': sum(work['_truncated'] for work in works),
            'works_without_collaborating_affiliations': without_affiliations,
        },
    }
    validate_snapshot(snapshot)
    return snapshot


def validate_snapshot(snapshot):
    if snapshot.get('schema_version') != 1:
        raise ValueError('Unsupported snapshot schema')
    pi_ids = {pi['id'] for pi in snapshot['pis']}
    if not pi_ids or len(pi_ids) != len(snapshot['pis']):
        raise ValueError('Missing or duplicate PI identities')
    work_ids = {work['id'] for work in snapshot['works']}
    if len(work_ids) != len(snapshot['works']):
        raise ValueError('Duplicate work IDs')
    for work in snapshot['works']:
        if not work['pi_ids'] or not set(work['pi_ids']).issubset(pi_ids):
            raise ValueError('Invalid work PI references')
        url = urllib.parse.urlparse(work['url'])
        if url.scheme != 'https' or url.netloc not in ('doi.org', 'openalex.org'):
            raise ValueError('Invalid publication URL')
    institution_ids = set()
    for institution in snapshot['institutions']:
        if institution['id'] in institution_ids:
            raise ValueError('Duplicate institution IDs')
        institution_ids.add(institution['id'])
        if not institution['work_ids'] or not set(institution['work_ids']).issubset(work_ids):
            raise ValueError('Invalid institution work references')
        if len(set(institution['work_ids'])) != len(institution['work_ids']):
            raise ValueError('Duplicate institution work references')
        if (institution['latitude'], institution['longitude']) != coordinates(institution):
            raise ValueError('Invalid institution coordinates')
    json.dumps(snapshot, allow_nan=False)


def request_json(endpoint, params, api_key):
    url = 'https://api.openalex.org/' + endpoint + '?' + urllib.parse.urlencode(params)
    headers = {'User-Agent': 'PediatricMSKLab-publication-network/1.0', 'Accept': 'application/json'}
    if api_key:
        headers['Authorization'] = 'Bearer ' + api_key
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            if error.code != 429 and error.code < 500:
                raise RuntimeError('OpenAlex request failed with HTTP ' + str(error.code)) from None
            if attempt == 3:
                raise RuntimeError('OpenAlex request failed after retries') from None
            time.sleep(2 ** attempt)
        except (urllib.error.URLError, TimeoutError):
            if attempt == 3:
                raise RuntimeError('OpenAlex network request failed after retries') from None
            time.sleep(2 ** attempt)


def validate_work_record(record):
    required = {'id', 'title', 'publication_year', 'doi', 'type', 'authorships'}
    if not isinstance(record, dict) or not required.issubset(record):
        raise ValueError('Incomplete OpenAlex work metadata')
    if not re.fullmatch(r'W\d+', short_id(record['id'])) or not isinstance(record['type'], str):
        raise ValueError('Invalid OpenAlex work metadata')
    if record['title'] is not None and not isinstance(record['title'], str):
        raise ValueError('Invalid OpenAlex work title')
    if record['publication_year'] is not None and (not isinstance(record['publication_year'], int)
                                                  or isinstance(record['publication_year'], bool)):
        raise ValueError('Invalid OpenAlex publication year')
    if record['doi'] is not None and not isinstance(record['doi'], str):
        raise ValueError('Invalid OpenAlex DOI')
    if not isinstance(record['authorships'], list):
        raise ValueError('Missing OpenAlex authorships')
    for authorship in record['authorships']:
        if not isinstance(authorship, dict) or not isinstance(authorship.get('author'), dict):
            raise ValueError('Invalid OpenAlex authorship')
        author = authorship['author']
        if 'id' not in author or (author['id'] is not None
                                 and not re.fullmatch(r'A\d+', short_id(author['id']))):
            raise ValueError('Invalid OpenAlex author identity')
        if author['id'] is None and not isinstance(author.get('display_name'), str):
            raise ValueError('Missing unresolved OpenAlex author name')
        if not isinstance(authorship.get('institutions'), list):
            raise ValueError('Missing OpenAlex authorship institutions')
        for institution in authorship['institutions']:
            if not isinstance(institution, dict) or not re.fullmatch(r'I\d+', short_id(institution.get('id'))):
                raise ValueError('Invalid OpenAlex affiliation identity')


def validate_institution_record(institution):
    required = {'id', 'display_name', 'geo', 'country_code', 'lineage'}
    if not isinstance(institution, dict) or not required.issubset(institution):
        raise ValueError('Incomplete OpenAlex institution metadata')
    if not re.fullmatch(r'I\d+', short_id(institution['id'])):
        raise ValueError('Invalid OpenAlex institution identity')
    if not isinstance(institution['display_name'], str) or not institution['display_name'].strip():
        raise ValueError('Missing OpenAlex institution name')
    if not isinstance(institution['lineage'], list):
        raise ValueError('Invalid OpenAlex institution lineage')
    if institution['geo'] is not None:
        if not isinstance(institution['geo'], dict) or not {'latitude', 'longitude'}.issubset(institution['geo']):
            raise ValueError('Incomplete OpenAlex geographic metadata')


def fetch_works(author_id, api_key):
    cursor = '*'
    seen_cursors = set()
    records = []
    expected_count = None
    while cursor is not None:
        if cursor in seen_cursors:
            raise ValueError('OpenAlex returned a repeated cursor')
        seen_cursors.add(cursor)
        response = request_json('works', {
            'filter': 'authorships.author.id:' + author_id,
            'per_page': 100, 'cursor': cursor,
            'select': 'id,title,publication_year,doi,type,authorships',
        }, api_key)
        results, meta = response.get('results'), response.get('meta')
        if not isinstance(results, list) or not isinstance(meta, dict) or 'next_cursor' not in meta:
            raise ValueError('Malformed OpenAlex works response')
        count = meta.get('count')
        if not isinstance(count, int) or count < 0:
            raise ValueError('Missing OpenAlex result count')
        if expected_count is None:
            expected_count = count
        if count != expected_count:
            raise ValueError('OpenAlex result count changed during paging; retry the refresh')
        for record in results:
            validate_work_record(record)
        records.extend(results)
        cursor = meta['next_cursor']
        if cursor is not None and (not isinstance(cursor, str) or not results):
            raise ValueError('Invalid OpenAlex paging response')
    if len(records) != expected_count or len({record['id'] for record in records}) != expected_count:
        raise ValueError('Incomplete OpenAlex publication history')
    return records


def fetch_institutions(institution_ids, api_key):
    institutions = {}
    ordered_ids = sorted(institution_ids)
    for offset in range(0, len(ordered_ids), 100):
        batch = ordered_ids[offset:offset + 100]
        response = request_json('institutions', {
            'filter': 'openalex_id:' + '|'.join(batch), 'per_page': 100,
            'select': 'id,display_name,geo,country_code,lineage',
        }, api_key)
        results = response.get('results')
        if not isinstance(results, list):
            raise ValueError('Malformed OpenAlex institutions response')
        for institution in results:
            validate_institution_record(institution)
            institutions[short_id(institution['id'])] = institution
        for institution_id in batch:
            if institution_id not in institutions:
                institution = request_json('institutions/' + institution_id, {}, api_key)
                validate_institution_record(institution)
                institutions[institution_id] = institution
    return institutions


def refresh_snapshot(output_path, identities, api_key):
    records = []
    for pi in identities['pis']:
        for author_id in pi['author_ids']:
            author_records = fetch_works(author_id, api_key)
            for record in author_records:
                record['_pi_ids'] = [pi['id']]
            records.extend(author_records)
    institution_ids = {short_id(institution['id']) for record in records
                       for authorship in record.get('authorships') or []
                       for institution in authorship.get('institutions') or [] if institution.get('id')}
    institutions = fetch_institutions(institution_ids, api_key)
    snapshot = build_snapshot(records, institutions, identities,
                              datetime.datetime.now(datetime.timezone.utc).isoformat())
    serialized = json.dumps(snapshot, ensure_ascii=False, allow_nan=False, separators=(',', ':')) + '\n'
    output_path = pathlib.Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=output_path.parent,
                                         prefix='.collaborations-', suffix='.tmp', delete=False) as output:
            temporary_path = pathlib.Path(output.name)
            output.write(serialized)
        os.replace(temporary_path, output_path)
    finally:
        if temporary_path and temporary_path.exists():
            temporary_path.unlink()
    return snapshot


def main():
    parser = argparse.ArgumentParser(description='Refresh the static OpenAlex collaboration snapshot')
    parser.add_argument('--output', type=pathlib.Path, default=pathlib.Path('data/collaborations.json'))
    args = parser.parse_args()
    identities = json.loads(pathlib.Path(__file__).with_name('collaboration-identities.json').read_text())
    try:
        snapshot = refresh_snapshot(args.output, identities, os.environ.get('OPENALEX_API_KEY'))
    except (RuntimeError, ValueError, KeyError, OSError) as error:
        parser.exit(1, 'Refresh failed; previous snapshot preserved. ' + str(error) + '\n')
    print('Saved ' + str(len(snapshot['works'])) + ' publications and '
          + str(len(snapshot['institutions'])) + ' institutions to ' + str(args.output))


if __name__ == '__main__':
    main()
