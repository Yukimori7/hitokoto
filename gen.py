#!/usr/bin/env python3
import glob
import json
import os
from pathlib import Path

SOURCE_PATTERN = "./sentences-bundle/sentences/*.json"
DATA_DIR = "data"


def main() -> None:
    # 按 type 聚合所有句子
    type_map: dict[str, list[dict]] = {}

    for file in glob.glob(SOURCE_PATTERN):
        try:
            with open(file, "r", encoding="utf-8") as f:
                data = json.load(f)

            if isinstance(data, list):
                fallback_type = Path(file).stem
                for item in data:
                    if not isinstance(item, dict):
                        continue

                    type_value = item.get("type")
                    sentence_type = (
                        type_value
                        if isinstance(type_value, str) and len(type_value) > 0
                        else fallback_type
                    )
                    type_map.setdefault(sentence_type, []).append(item)
        except Exception as error:
            print(f"Failed to parse file {file}: {error}")

    all_types = list(type_map.keys())
    if len(all_types) == 0:
        print("No data, END....")
        return

    total_count = sum(len(type_map[sentence_type]) for sentence_type in all_types)
    print(f"Found {total_count} sentences, begin generate data...")

    os.makedirs(DATA_DIR, exist_ok=True)

    # 按 type 生成 data/<type>/0.json,1.json,2.json...
    for sentence_type in all_types:
        type_dir = os.path.join(DATA_DIR, sentence_type)
        os.makedirs(type_dir, exist_ok=True)

        items = type_map[sentence_type]
        for i, item in enumerate(items):
            file_path = os.path.join(type_dir, f"{i}.json")
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(item, f, ensure_ascii=False)

        print(f"Generated {len(items)} files in data/{sentence_type}")

    # 生成 data/type.json，内容为 { [type]: count }
    type_file_path = os.path.join(DATA_DIR, "type.json")
    type_count_map = {sentence_type: len(type_map[sentence_type]) for sentence_type in all_types}
    with open(type_file_path, "w", encoding="utf-8") as f:
        json.dump(type_count_map, f, ensure_ascii=False)
    print(f"Generated {type_file_path}")

    print("END....")


if __name__ == "__main__":
    main()
