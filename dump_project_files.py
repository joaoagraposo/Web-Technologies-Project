import os

# Pasta base (pode ser alterada se quiseres apontar para outro diretório)
BASE_DIR = '.'
OUTPUT_FILE = 'project_dump.txt'


def should_skip(filename, self_path):
    """Define ficheiros e pastas a ignorar."""
    skip_dirs = {'.git', '__pycache__', 'node_modules', 'venv'}
    skip_exts = {'.pyc', '.png', '.jpg', '.jpeg', '.gif', '.exe', '.dll', '.zip'}

    # Ignorar certas pastas
    if any(part in skip_dirs for part in filename.split(os.sep)):
        return True

    # Ignorar formatos binários
    _, ext = os.path.splitext(filename.lower())
    if ext in skip_exts:
        return True

    # Ignorar o próprio ficheiro e o ficheiro de saída
    if os.path.abspath(filename) in {os.path.abspath(self_path), os.path.abspath(OUTPUT_FILE)}:
        return True

    return False


def dump_files(base_dir=BASE_DIR, output_path=OUTPUT_FILE):
    self_path = os.path.abspath(__file__)

    with open(output_path, 'w', encoding='utf-8') as out:
        for root, _, files in os.walk(base_dir):
            for fname in files:
                full_path = os.path.join(root, fname)
                if should_skip(full_path, self_path):
                    continue
                try:
                    with open(full_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                except Exception as e:
                    print(f"[Aviso] Não consegui ler {full_path}: {e}")
                    continue
                
                # Escreve cabeçalho + conteúdo
                out.write(f"\n{'='*80}\n")
                out.write(f"Arquivo: {os.path.relpath(full_path, base_dir)}\n")
                out.write(f"{'='*80}\n\n")
                out.write(content)
                out.write("\n\n")

    print(f"\n✅ Conteúdo de todos os ficheiros guardado em: {os.path.abspath(output_path)}")


if __name__ == "__main__":
    dump_files()