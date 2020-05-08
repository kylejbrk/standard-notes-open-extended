import requests
import json
import os
from urllib.parse import urljoin
from io import BytesIO
from zipfile import ZipFile

def main():
    ext_dir = 'extensions'
    public_dir = 'public'

    if not os.path.exists(public_dir):
        os.makedirs(public_dir)

    github_session = create_session(os.environ['GITHUB_USER'], os.environ['GITHUB_TOKEN'])
    domain = os.environ['DOMAIN']

    for file in os.listdir(ext_dir):
        fp = os.path.join(ext_dir,file)
        meta, index = extract_config(fp)

        version, download_url = get_latest(meta['github'], github_session)
        ext_name = file.replace('.json', '')

        output_dir = os.path.join(public_dir, ext_name)
        get_zip_contents(github_session, download_url, os.path.join(output_dir, version))

        url = urljoin(
            domain, 
            '/'.join([ext_name, version, meta['main']])
        )
        latest_url = urljoin(
            domain, 
            '/'.join([ext_name, 'index.json'])
        )

        index.update({
            'version': version,
            'download_url': download_url,
            'url': url,
            "latest_url": latest_url
        })

        with open(os.path.join(output_dir, 'index.json'), 'w') as f:
            json.dump(index, f, indent=4)


def get_zip_contents(session, url, dir):
    resp = session.get(url)
    data = BytesIO(resp.content) 
    
    with ZipFile(data) as zip_file:
        for file in zip_file.namelist():
            filename = '/'.join(file.split('/')[1:]) # Parse files list excluding the top/parent/root directory

            if filename == '' or filename.startswith('.'):
                continue #  Ignore dot file and top level directory 
            
            zip_file.extract(filename, dir)
            
def create_session(user, token):
    session = requests.Session()
    session.auth = (user, token)

    return session

def get_latest(repo, session):
    resp = session.get('https://api.github.com/repos/{}/releases/latest'.format(repo))
    data = resp.json()

    return data['tag_name'], data['zipball_url']

def extract_config(fp):
    with open(fp, 'r') as f:
        json_txt = json.load(f)

    return json_txt['meta'], json_txt['index']

if __name__ == '__main__':
    main()