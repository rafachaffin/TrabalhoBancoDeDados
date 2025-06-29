#!/usr/bin/env python3
"""
Script para corrigir collation nos arquivos SQL para compatibilidade com MariaDB
"""

import os
import glob

def fix_collation_in_file(file_path):
    """Corrige a collation em um arquivo SQL"""
    print(f"Processando: {file_path}")
    
    # Lê o arquivo
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Substitui a collation problemática
    old_content = content
    content = content.replace('utf8mb4_0900_ai_ci', 'utf8mb4_general_ci')
    content = content.replace('utf8mb4_0900_as_ci', 'utf8mb4_general_ci')
    content = content.replace('utf8mb4_0900_as_cs', 'utf8mb4_general_ci')
    
    # Se houve mudança, salva o arquivo
    if content != old_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Corrigido: {file_path}")
    else:
        print(f"ℹ️  Sem alterações: {file_path}")

def main():
    """Função principal"""
    dump_dir = "Dump20250629"
    
    if not os.path.exists(dump_dir):
        print(f"❌ Diretório {dump_dir} não encontrado!")
        return
    
    # Lista todos os arquivos .sql
    sql_files = glob.glob(f"{dump_dir}/*.sql")
    
    if not sql_files:
        print(f"❌ Nenhum arquivo .sql encontrado em {dump_dir}")
        return
    
    print(f"🔧 Corrigindo collation em {len(sql_files)} arquivos...")
    
    for sql_file in sql_files:
        fix_collation_in_file(sql_file)
    
    print("✅ Processamento concluído!")

if __name__ == "__main__":
    main() 