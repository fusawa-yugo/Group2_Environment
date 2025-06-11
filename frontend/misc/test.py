import re
import math

# --- 共通のヘルパー関数 ---
def hex_to_rgb(hex_color: str) -> tuple[int, int, int] | None:
    """
    16進数カラーコードをRGBタプル (R, G, B) に変換します。
    例: "#RRGGBB" または "#RGB" -> (R, G, B)
    """
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join([c*2 for c in hex_color])
    if len(hex_color) == 6:
        try:
            r = int(hex_color[0:2], 16)
            g = int(hex_color[2:4], 16)
            b = int(hex_color[4:6], 16)
            return (r, g, b)
        except ValueError:
            return None # 変換できなかった場合はNoneを返す
    return None

def parse_rgb_string(rgb_str: str) -> tuple[int, int, int] | None:
    """
    "rgb(R,G,B)" 形式の文字列をRGBタプル (R, G, B) に変換します。
    """
    match = re.match(r'rgb\((\d+),\s*(\d+),\s*(\d+)\)', rgb_str)
    if match:
        try:
            r, g, b = int(match.group(1)), int(match.group(2)), int(match.group(3))
            return (r, g, b)
        except ValueError:
            return None
    return None

def color_distance(color1: tuple[int, int, int], color2: tuple[int, int, int]) -> float:
    """
    2つのRGB色のユークリッド距離を計算します。
    """
    return math.sqrt(
        (color1[0] - color2[0])**2 +
        (color1[1] - color2[1])**2 +
        (color1[2] - color2[2])**2
    )

# --- メインの処理関数 ---
def drop_distant_colored_svg_lines(svg_data: str, target_hex_color: str, distance_threshold: float = 100.0) -> str:
    """
    SVGデータから、特定のターゲット色から「遠い」fill属性を持つ行を削除します。
    fill属性のカラーコードは、16進数またはRGB形式に対応します。

    Args:
        svg_data (str): SVGデータを表す文字列。
        target_hex_color (str): 基準となるHEXカラーコード (例: '#F7DCCB')。
        distance_threshold (float): これより距離が大きければ「遠い」と判断するしきい値。
                                   最大値は √(255^2 * 3) ≈ 441.67 です。

    Returns:
        str: 遠い色のfill属性を持つ行が削除されたSVGデータ。
    """
    # ターゲット色をRGBに変換
    target_rgb = hex_to_rgb(target_hex_color)
    if target_rgb is None:
        print(f"警告: ターゲットカラー '{target_hex_color}' の変換に失敗しました。処理を中断します。")
        return svg_data

    lines = svg_data.splitlines()
    filtered_lines = []

    # fill属性値にマッチするための正規表現パターン
    # 16進数カラーコードとRGB形式の両方に対応
    fill_pattern = re.compile(
        r'(fill=")((?:#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)))',
        re.IGNORECASE
    )

    for line in lines:
        match = fill_pattern.search(line)
        if match:
            color_value_str = match.group(2) # 例: "#F7DCCB" or "rgb(247,220,203)"
            current_rgb = None

            if color_value_str.startswith('#'):
                current_rgb = hex_to_rgb(color_value_str)
            elif color_value_str.startswith('rgb('):
                current_rgb = parse_rgb_string(color_value_str)

            if current_rgb:
                dist = color_distance(target_rgb, current_rgb)
                if dist <= distance_threshold:
                    # ターゲット色に近い行は残す
                    filtered_lines.append(line)
                # else: 遠い色はスキップ（削除）
            else:
                # 色の解析に失敗した行は残す（削除しない）
                filtered_lines.append(line)
        else:
            # fill属性がない行は残す
            filtered_lines.append(line)

    return "\n".join(filtered_lines)

# --- ファイル操作 ---
# SVGファイルを読み込む
with open('./raw_map.svg', 'r', encoding='utf-8') as file:
    sample_svg_data = file.read()

# 基準となる色（例: #F7DCCB）
target_color_hex = '#F7DCCB'

# 距離のしきい値。この値を調整して「近い」の範囲を定義します。
# 0に近づけば厳密に同じ色だけが残り、大きくすればするほど多くの色が残ります。
# RGB空間での最大距離は約441.67 (黒と白の距離) です。
# 100は比較的近い色を残す目安です。
color_distance_threshold = 20

# 関数を実行して、結果を取得します。
cleaned_svg_data = drop_distant_colored_svg_lines(
    sample_svg_data,
    target_color_hex,
    color_distance_threshold
)

# 処理されたSVGデータを出力します。
with open('./filtered_map_by_distance.svg', 'w', encoding='utf-8') as output_file:
    output_file.write(cleaned_svg_data)

print(f"SVGから基準色 {target_color_hex} から距離 {color_distance_threshold} 以上離れた色の要素を削除し、'filtered_map_by_distance.svg' に保存しました。")