import os
import zipfile
import json
import requests
from io import BytesIO
from urllib.parse import urljoin, urlparse

def process_extensions(ext_dir: str, output_dir: str, domain: str):
    for f in os.listdir(ext_dir):
        # download and process zips
        json_path = os.path.join(ext_dir, f)
        index_info = read_json(json_path)
        
        download_url = index_info['download_url']
        resp = requests.get(download_url)
        
        output_path = os.path.join(output_dir, f.replace('.json', ''))

        data = BytesIO(resp.content) 
        with zipfile.ZipFile(data) as z:
            z.extractall(output_path)

        # generate the index
        package_path = os.path.join(output_path, 'package.json')
        package_info = read_json(package_path)

        root_file = package_info.get('sn', {}).get('main', 'index.html')
        base_url = urljoin(domain, output_path.replace('\\', '/') + '/')

        index_info['url'] = urljoin(base_url, root_file)
        index_info['version'] = package_info['version']
        index_info['latest_url'] = urljoin(base_url, 'index.json')
        index_info['identifier'] = gen_ident(base_url)

        with open(os.path.join(output_path, 'index.json'), 'w') as f:
            json.dump(index_info, f, indent = 4)    

        print('Hosting {} at {}'.format(index_info['name'], index_info['latest_url']))

def gen_ident(url):
    parsed_url = urlparse(url)
    netloc = parsed_url[1]
    path = parsed_url[2]

    ident = '.'.join(netloc.split('.')[::-1])
    ident += '.' + path.split('/')[-2]

    return ident

def get_domain() -> str:
    if 'CUSTOM_DOMAIN' in os.environ:
        return os.environ['CUSTOM_DOMAIN']
    else:
        repo = os.environ['GITHUB_REPOSITORY']
        user = repo.split('/')[0]
        name = repo.split('/')[1]

        return f'https://{user}.github.io/{name}/'

def read_json(fp: str) -> dict:
    with open(fp, 'r') as f:
        return json.load(f)

if __name__ == '__main__': 
    ext_dir = 'extensions'
    output_dir = 'public'
    domain = get_domain()
    
    process_extensions(ext_dir, output_dir, domain)