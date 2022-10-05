import os
import zipfile
import json
import requests
import shutil

from io import BytesIO
from urllib.parse import urljoin, urlparse

def process_extensions(source_dir: str, target_dir: str, domain: str):
    target_ext_dir = os.path.join(target_dir, 'exts')
    target_zip_dir = os.path.join(target_dir, 'zips')
    
    github_session = create_session()
    content_list = {}

    for f in os.listdir(source_dir):
        json_path = os.path.join(source_dir, f)
        index_info = read_json(json_path)
        
        download_url = index_info['download_url']
        output_path = os.path.join(target_ext_dir, f.replace('.json', ''))
        rel_output_path = os.path.relpath(output_path, target_dir)
        
        extract_zip(download_url, github_session, output_path)

        zip_path = create_new_zip(output_path, target_zip_dir, target_ext_dir)
        rel_zip_path = os.path.relpath(zip_path, target_dir)

        gen_index(output_path, rel_output_path, rel_zip_path, index_info, domain)

        content_info = {'Name': index_info['name'], 'Link': index_info['latest_url']}
        content_type = index_info['content_type']

        if content_type in content_list:
            content_list[content_type].append(content_info)
        else:
            content_list[content_type] = [content_info]

        print('Hosting {} at {}'.format(index_info['name'], index_info['latest_url']))
    
    gen_readme(content_list, target_dir)

def create_new_zip(output_path: str, target_zip_dir: str, target_ext_dir: str) -> str:
    zip_name = os.path.basename(output_path)

    zip_path = shutil.make_archive(
        os.path.join(target_zip_dir, zip_name), 
        'zip', 
        root_dir=target_ext_dir, 
        base_dir=zip_name
    )

    return zip_path

def gen_readme(content_list: dict, output_dir: str):
    readme = []

    for cont_type in content_list.keys():
        readme.append('# ' + cont_type)

        for ext in content_list[cont_type]:
            readme.append('- ' + ext['Name'] + ': ' + ext['Link'])

    readme = '\n'.join(readme)

    with open(os.path.join(output_dir, 'README.md'), 'w') as f:
        f.write(readme)


def gen_index(output_path: str, rel_output_path: str, rel_zip_path: str, index_info: dict, domain: str):
    package_path = os.path.join(output_path, 'package.json')
    package_info = read_json(package_path)

    root_file = package_info.get('sn', {}).get('main', 'index.html')    
    base_url = urljoin(domain, rel_output_path.replace('\\', '/') + '/')
    download_url = urljoin(domain, rel_zip_path.replace('\\', '/'))

    index_info['url'] = urljoin(base_url, root_file)
    index_info['version'] = package_info['version']
    index_info['latest_url'] = urljoin(base_url, 'index.json')
    index_info['identifier'] = gen_ident(base_url)
    index_info['download_url'] = download_url

    with open(os.path.join(output_path, 'index.json'), 'w') as f:
        json.dump(index_info, f, indent = 4)    

def create_session():
    session = requests.Session()

    if 'GITHUB_TOKEN' in os.environ:
        session.headers.update({'Authorization': 'token ' + os.environ['GITHUB_TOKEN']})

    return session

def extract_zip(download_url: str, github_session: requests.Session, output_path: str):
    resp = github_session.get(download_url)
    data = BytesIO(resp.content) 

    with zipfile.ZipFile(data) as z:
        prefix = os.path.commonprefix(z.namelist())
    
        for file_info in z.infolist():
            if file_info.is_dir():
                continue

            file_path = file_info.filename

            extracted_path = file_path.replace(prefix, '')
            extracted_path = os.path.join(output_path, extracted_path)

            os.makedirs(os.path.dirname(extracted_path), exist_ok=True)

            content = z.read(file_path)
            with open(extracted_path, 'wb') as f:
                f.write(content)

def gen_ident(url: str):
    parsed_url = urlparse(url)
    netloc = parsed_url[1]
    path = parsed_url[2]

    ident = '.'.join(netloc.split('.')[::-1])
    ident += '.' + path.split('/')[-2]

    return ident

def get_domain(target_dir: str) -> str:
    if 'CUSTOM_DOMAIN' in os.environ:
        if os.environ['CUSTOM_DOMAIN'].endswith('/'):
            return os.environ['CUSTOM_DOMAIN']
        else:
            return urljoin(os.environ['CUSTOM_DOMAIN'], '/')
    elif 'GITHUB_REPOSITORY' in os.environ:
        repo = os.environ['GITHUB_REPOSITORY']
        
        user = repo.split('/')[0]
        name = repo.split('/')[1]

        return f'https://{user}.github.io/{name}/'
    else:
        return urljoin('http://localhost:5500/', target_dir + '/') # this is used for live server when testing

def read_json(fp: str) -> dict:
    with open(fp, 'r') as f:
        return json.load(f)

if __name__ == '__main__': 
    source_dir = 'extensions'
    target_dir = 'public'
    domain = get_domain(target_dir)
    
    process_extensions(source_dir, target_dir, domain)