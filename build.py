import requests
import json
import yaml
import os
from urllib.parse import urljoin
from io import BytesIO, UnsupportedOperation
from zipfile import ZipFile

def main():
    ext_dir = 'extensions'
    public_dir = 'public'

    os.makedirs(public_dir, exist_ok=True)

    github_session = create_session(os.environ['GITHUB_TOKEN'])

    if 'CUSTOM_DOMAIN' in os.environ:
        domain = os.environ['CUSTOM_DOMAIN']
    else:
        domain = create_domain(os.environ['GITHUB_REPOSITORY'])

    packages = []
    for file in os.listdir(ext_dir):
        fp = os.path.join(ext_dir,file)
        meta, index = extract_config(fp)

        version, download_url = get_latest(meta['github'], github_session)
        ext_name = file.replace('.yaml', '')

        # Get source from github releases 
        output_dir = os.path.join(public_dir, ext_name)
        get_zip_contents(github_session, download_url, output_dir)

        # Build index.json
        url, latest_url = create_urls(domain, ext_name, meta['main'])
        index.update({'version': version, 'download_url': download_url, 'url': url, 'latest_url': latest_url})
        packages.append(index)

        with open(os.path.join(output_dir, 'index.json'), 'w') as f:
            json.dump(index, f, indent=4)

        print('{:36} {:16} {:10}\t(created)'.format(index['name'], index['content_type'] , version))

    # Sort packages by content/name
    packages.sort(key=lambda k: k['name'])
    packages.sort(key=lambda k: k['content_type'])

    with open(os.path.join(public_dir, 'index.json'), 'w') as f:
        json.dump({'content_type': 'SN|Repo', 'packages': packages,}, f, indent=4)
    
    print("\nResults: {:22s}{} extensions {}".format("", len(packages), get_stats(packages)))
    print("Repository Endpoint URL: {:6s}{}".format("", urljoin(domain, 'index.json')))

def create_domain(repo):
    user = repo.split('/')[0]
    name = repo.split('/')[1]

    return 'https://{}.github.io/{}/'.format(user, name)

def get_stats(packages):
    stats = {}
    for package in packages:
        content = package['content_type']

        if content in stats:
            stats[content] += 1
        else:
            stats[content] = 1
    
    return stats

def create_urls(domain, ext_name, main):
    url = urljoin(
        domain, 
        '/'.join([ext_name, main])
    )
    latest_url = urljoin(
        domain, 
        '/'.join([ext_name, 'index.json'])
    )

    return url, latest_url

def get_zip_contents(session, url, output_dir):
    resp = session.get(url)
    data = BytesIO(resp.content) 
    
    with ZipFile(data) as zip_file:
        for member in zip_file.namelist():
            filename = '/'.join(member.split('/')[1:])

            if filename.endswith('/') or not filename:
                continue 
            
            content = zip_file.read(member)
            output_path = os.path.join(output_dir, filename)
            
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            with open(output_path, 'wb') as f:
                f.write(content)
            
def create_session(token):
    session = requests.Session()
    session.headers.update({'Authorization': 'token ' + token})

    return session

def get_latest(repo, session):
    resp = session.get('https://api.github.com/repos/{}/releases/latest'.format(repo))
    data = resp.json()

    return data['tag_name'], data['zipball_url']

def extract_config(fp):
    with open(fp, 'r') as f:
        yml_txt = yaml.load(f, Loader=yaml.FullLoader)

    return yml_txt['meta'], yml_txt['index']

if __name__ == '__main__':
    main()