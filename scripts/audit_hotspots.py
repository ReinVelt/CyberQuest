#!/usr/bin/env python3
"""Audit scene hotspots against SVG element positions."""

import re
import os
import xml.etree.ElementTree as ET

SCENES_DIR = 'scenes'
SVG_DIR = 'assets/images/scenes'

def extract_hotspots(scene_js_path):
    """Extract hotspot definitions from a scene.js file."""
    with open(scene_js_path) as f:
        content = f.read()
    
    hotspot_match = re.search(r'hotspots:\s*\[', content)
    if not hotspot_match:
        return []
    
    pos = hotspot_match.start()
    bracket_depth = 0
    in_hotspots = False
    blocks = []
    current_block = ''
    
    for c in content[pos:]:
        if c == '[' and not in_hotspots:
            in_hotspots = True
            bracket_depth = 1
            continue
        if not in_hotspots:
            continue
        if c == '{':
            bracket_depth += 1
            current_block = '{'
        elif c == '}':
            bracket_depth -= 1
            current_block += '}'
            if bracket_depth == 1:
                blocks.append(current_block)
                current_block = ''
        elif bracket_depth >= 2:
            current_block += c
        if bracket_depth == 0:
            break
    
    hotspots = []
    for block in blocks:
        id_m = re.search(r'''id\s*:\s*['"]([^'"]+)['"]''', block)
        name_m = re.search(r'''name\s*:\s*['"]([^'"]+)['"]''', block)
        x_m = re.search(r'(?<!\w)x\s*:\s*([0-9.]+)', block)
        y_m = re.search(r'(?<!\w)y\s*:\s*([0-9.]+)', block)
        w_m = re.search(r'width\s*:\s*([0-9.]+)', block)
        h_m = re.search(r'height\s*:\s*([0-9.]+)', block)
        cursor_m = re.search(r'''cursor\s*:\s*['"]([^'"]+)['"]''', block)
        
        if id_m or name_m:
            hotspots.append({
                'id': id_m.group(1) if id_m else None,
                'name': name_m.group(1) if name_m else None,
                'x': float(x_m.group(1)) if x_m else None,
                'y': float(y_m.group(1)) if y_m else None,
                'width': float(w_m.group(1)) if w_m else None,
                'height': float(h_m.group(1)) if h_m else None,
                'cursor': cursor_m.group(1) if cursor_m else None,
                'raw': block[:200]
            })
    
    return hotspots


def parse_svg(svg_path):
    """Parse SVG and extract viewBox, key elements with positions."""
    try:
        tree = ET.parse(svg_path)
    except ET.ParseError as e:
        return {'error': str(e), 'viewBox': None, 'elements': []}
    
    root = tree.getroot()
    ns = {'svg': 'http://www.w3.org/2000/svg'}
    
    # Get viewBox
    viewbox = root.get('viewBox', '')
    width = root.get('width', '')
    height = root.get('height', '')
    
    vb_parts = viewbox.split() if viewbox else []
    vb_w = float(vb_parts[2]) if len(vb_parts) >= 4 else None
    vb_h = float(vb_parts[3]) if len(vb_parts) >= 4 else None
    
    elements = []
    
    def strip_ns(tag):
        return tag.split('}')[-1] if '}' in tag else tag
    
    def process_element(elem, parent_transform=''):
        tag = strip_ns(elem.tag)
        eid = elem.get('id', '')
        transform = elem.get('transform', '')
        
        # Extract translate from transform
        tx, ty = 0, 0
        t_match = re.search(r'translate\(([^,)]+)[,\s]+([^)]+)\)', transform)
        if t_match:
            tx = float(t_match.group(1))
            ty = float(t_match.group(2))
        
        info = {
            'tag': tag,
            'id': eid,
            'transform': transform,
        }
        
        def safe_float(val, default=0):
            if val is None:
                return default
            val = str(val).strip().rstrip('%')
            try:
                return float(val)
            except (ValueError, TypeError):
                return default

        if tag == 'rect':
            info['x'] = safe_float(elem.get('x', 0))
            info['y'] = safe_float(elem.get('y', 0))
            info['width'] = safe_float(elem.get('width', 0))
            info['height'] = safe_float(elem.get('height', 0))
            info['abs_x'] = info['x'] + tx
            info['abs_y'] = info['y'] + ty
        elif tag == 'circle':
            info['cx'] = safe_float(elem.get('cx', 0))
            info['cy'] = safe_float(elem.get('cy', 0))
            info['r'] = safe_float(elem.get('r', 0))
        elif tag == 'ellipse':
            info['cx'] = safe_float(elem.get('cx', 0))
            info['cy'] = safe_float(elem.get('cy', 0))
            info['rx'] = safe_float(elem.get('rx', 0))
            info['ry'] = safe_float(elem.get('ry', 0))
        elif tag == 'text':
            info['x'] = safe_float(elem.get('x', 0))
            info['y'] = safe_float(elem.get('y', 0))
            info['text'] = ''.join(elem.itertext())[:100]
        elif tag == 'image':
            info['x'] = safe_float(elem.get('x', 0))
            info['y'] = safe_float(elem.get('y', 0))
            info['width'] = safe_float(elem.get('width', 0))
            info['height'] = safe_float(elem.get('height', 0))
        elif tag == 'g':
            info['children_count'] = len(list(elem))
        elif tag == 'path':
            d = elem.get('d', '')
            # Extract first M command for approximate position
            m_match = re.search(r'[Mm]\s*([0-9.-]+)[,\s]+([0-9.-]+)', d)
            if m_match:
                info['start_x'] = float(m_match.group(1))
                info['start_y'] = float(m_match.group(2))
            info['d_preview'] = d[:80]
        elif tag == 'polygon' or tag == 'polyline':
            points = elem.get('points', '')
            info['points_preview'] = points[:80]
        
        if eid or tag in ('rect', 'circle', 'ellipse', 'image', 'text', 'polygon', 'polyline'):
            elements.append(info)
        
        for child in elem:
            process_element(child, transform)
    
    for child in root:
        process_element(child)
    
    return {
        'viewBox': viewbox,
        'width': width,
        'height': height,
        'vb_w': vb_w,
        'vb_h': vb_h,
        'elements': elements
    }


def is_nav_hotspot(hotspot):
    """Check if this is a navigation/back/exit hotspot."""
    hid = (hotspot.get('id') or '').lower()
    hname = (hotspot.get('name') or '').lower()
    nav_keywords = ['back', 'exit', 'leave', 'drive', 'return', 'go_to', 'goto',
                    'navigate', 'door', 'path', 'road', 'arrow', 'map']
    for kw in nav_keywords:
        if kw in hid or kw in hname:
            return True
    return False


def find_matching_svg_element(hotspot, elements, vb_w, vb_h):
    """Try to find SVG element that matches a hotspot."""
    if not vb_w or not vb_h:
        return None, "No viewBox"
    
    hid = (hotspot.get('id') or '').lower()
    hname = (hotspot.get('name') or '').lower()
    
    # Try to match by ID
    for elem in elements:
        eid = elem.get('id', '').lower()
        if eid and (eid in hid or hid in eid or eid in hname or hname in eid):
            return elem, "ID match"
    
    # Try keyword matching
    keywords = set()
    for word in re.split(r'[_\s-]+', hid):
        if word and len(word) > 2:
            keywords.add(word)
    for word in re.split(r'[_\s-]+', hname):
        if word and len(word) > 2:
            keywords.add(word)
    
    for elem in elements:
        eid = elem.get('id', '').lower()
        for kw in keywords:
            if kw in eid:
                return elem, f"Keyword match ({kw})"
    
    # Try position matching
    if hotspot.get('x') is not None and hotspot.get('y') is not None:
        hx_abs = hotspot['x'] / 100.0 * vb_w
        hy_abs = hotspot['y'] / 100.0 * vb_h
        hw_abs = (hotspot.get('width') or 5) / 100.0 * vb_w
        hh_abs = (hotspot.get('height') or 5) / 100.0 * vb_h
        
        # Center of hotspot
        hcx = hx_abs + hw_abs / 2
        hcy = hy_abs + hh_abs / 2
        
        best_dist = float('inf')
        best_elem = None
        
        for elem in elements:
            ex, ey = None, None
            if 'x' in elem and elem['tag'] != 'text':
                ex = elem.get('abs_x', elem['x'])
                ey = elem.get('abs_y', elem['y'])
                ew = elem.get('width', 0)
                eh = elem.get('height', 0)
                ecx = ex + ew / 2
                ecy = ey + eh / 2
            elif 'cx' in elem:
                ecx = elem['cx']
                ecy = elem['cy']
            elif 'start_x' in elem:
                ecx = elem['start_x']
                ecy = elem['start_y']
            else:
                continue
            
            dist = ((hcx - ecx) ** 2 + (hcy - ecy) ** 2) ** 0.5
            if dist < best_dist:
                best_dist = dist
                best_elem = elem
        
        if best_elem and best_dist < max(vb_w, vb_h) * 0.15:
            return best_elem, f"Position proximity (dist={best_dist:.1f})"
    
    return None, "No match found"


def compute_percentage(abs_val, total):
    """Convert absolute SVG coord to percentage."""
    if total and total > 0:
        return abs_val / total * 100.0
    return None


def main():
    scenes = sorted(os.listdir(SCENES_DIR))
    
    all_nav_hotspots = []
    all_issues = []
    all_scene_reports = []
    
    for scene_name in scenes:
        scene_js = os.path.join(SCENES_DIR, scene_name, 'scene.js')
        svg_path = os.path.join(SVG_DIR, f'{scene_name}.svg')
        
        if not os.path.isfile(scene_js):
            continue
        
        hotspots = extract_hotspots(scene_js)
        has_svg = os.path.isfile(svg_path)
        
        report = {
            'scene': scene_name,
            'has_svg': has_svg,
            'hotspot_count': len(hotspots),
            'hotspots': [],
        }
        
        svg_info = None
        if has_svg:
            svg_info = parse_svg(svg_path)
            report['viewBox'] = svg_info.get('viewBox', '')
            report['vb_w'] = svg_info.get('vb_w')
            report['vb_h'] = svg_info.get('vb_h')
            report['svg_element_count'] = len(svg_info['elements'])
            report['svg_ids'] = [e['id'] for e in svg_info['elements'] if e.get('id')]
        
        for hs in hotspots:
            hs_report = {
                'id': hs.get('id'),
                'name': hs.get('name'),
                'x': hs.get('x'),
                'y': hs.get('y'),
                'width': hs.get('width'),
                'height': hs.get('height'),
                'is_nav': is_nav_hotspot(hs),
            }
            
            if svg_info and svg_info.get('vb_w'):
                match, match_type = find_matching_svg_element(
                    hs, svg_info['elements'], svg_info['vb_w'], svg_info['vb_h']
                )
                hs_report['svg_match'] = match_type
                
                if match:
                    hs_report['matched_element'] = {
                        'tag': match.get('tag'),
                        'id': match.get('id'),
                    }
                    
                    # Calculate alignment
                    vb_w = svg_info['vb_w']
                    vb_h = svg_info['vb_h']
                    
                    if match.get('tag') == 'rect' or (match.get('tag') == 'image' and 'width' in match):
                        mx = match.get('abs_x', match.get('x', 0))
                        my = match.get('abs_y', match.get('y', 0))
                        mw = match.get('width', 0)
                        mh = match.get('height', 0)
                        
                        expected_x_pct = mx / vb_w * 100
                        expected_y_pct = my / vb_h * 100
                        expected_w_pct = mw / vb_w * 100
                        expected_h_pct = mh / vb_h * 100
                        
                        hs_report['expected_x'] = round(expected_x_pct, 2)
                        hs_report['expected_y'] = round(expected_y_pct, 2)
                        hs_report['expected_w'] = round(expected_w_pct, 2)
                        hs_report['expected_h'] = round(expected_h_pct, 2)
                        
                        if hs.get('x') is not None:
                            dx = abs(hs['x'] - expected_x_pct)
                            dy = abs(hs['y'] - expected_y_pct)
                            dw = abs((hs.get('width') or 0) - expected_w_pct)
                            dh = abs((hs.get('height') or 0) - expected_h_pct)
                            
                            hs_report['delta_x'] = round(dx, 2)
                            hs_report['delta_y'] = round(dy, 2)
                            hs_report['delta_w'] = round(dw, 2)
                            hs_report['delta_h'] = round(dh, 2)
                            
                            if dx > 3 or dy > 3 or dw > 5 or dh > 5:
                                hs_report['alignment'] = 'MISALIGNED'
                                all_issues.append({
                                    'scene': scene_name,
                                    'file': scene_js,
                                    'hotspot_id': hs.get('id'),
                                    'hotspot_name': hs.get('name'),
                                    'current': f"x={hs['x']}, y={hs['y']}, w={hs.get('width')}, h={hs.get('height')}",
                                    'suggested': f"x={round(expected_x_pct, 2)}, y={round(expected_y_pct, 2)}, w={round(expected_w_pct, 2)}, h={round(expected_h_pct, 2)}",
                                    'matched_svg_element': match.get('id', match.get('tag')),
                                })
                            else:
                                hs_report['alignment'] = 'OK'
                    elif match.get('tag') == 'circle':
                        cr = match.get('r', 0)
                        expected_cx_pct = match['cx'] / vb_w * 100
                        expected_cy_pct = match['cy'] / vb_h * 100
                        expected_r_w_pct = cr / vb_w * 100
                        expected_r_h_pct = cr / vb_h * 100
                        
                        hs_report['expected_x'] = round(expected_cx_pct - expected_r_w_pct, 2)
                        hs_report['expected_y'] = round(expected_cy_pct - expected_r_h_pct, 2)
                        hs_report['expected_w'] = round(expected_r_w_pct * 2, 2)
                        hs_report['expected_h'] = round(expected_r_h_pct * 2, 2)
                        hs_report['alignment'] = 'NEEDS_CHECK'
                    else:
                        hs_report['alignment'] = 'NEEDS_MANUAL_CHECK'
                else:
                    hs_report['svg_match'] = 'NO_MATCH'
                    hs_report['alignment'] = 'NO_SVG_ELEMENT'
            
            if hs_report['is_nav']:
                # Check if there's a visual indicator in SVG
                has_visual = False
                if svg_info:
                    hid = (hs.get('id') or '').lower()
                    hname = (hs.get('name') or '').lower()
                    for elem in svg_info.get('elements', []):
                        eid = elem.get('id', '').lower()
                        if any(kw in eid for kw in ['arrow', 'back', 'exit', 'nav', 'door', 'path_to', 'road', 'sign', 'leave']):
                            if any(kw in hid or kw in hname for kw in eid.split('_') if len(kw) > 2):
                                has_visual = True
                                break
                        # Also check text elements
                        if elem.get('tag') == 'text':
                            txt = elem.get('text', '').lower()
                            if any(kw in txt for kw in ['back', 'exit', 'leave', 'return', 'arrow']):
                                has_visual = True
                                break
                
                hs_report['nav_has_visual'] = has_visual
                all_nav_hotspots.append({
                    'scene': scene_name,
                    'id': hs.get('id'),
                    'name': hs.get('name'),
                    'x': hs.get('x'),
                    'y': hs.get('y'),
                    'w': hs.get('width'),
                    'h': hs.get('height'),
                    'has_visual': has_visual,
                })
            
            report['hotspots'].append(hs_report)
        
        all_scene_reports.append(report)
    
    # Print report
    print("=" * 80)
    print("HOTSPOT AUDIT REPORT")
    print("=" * 80)
    
    print("\n## 1. SVG FILES FOUND\n")
    svg_files = sorted([f for f in os.listdir(SVG_DIR) if f.endswith('.svg') and '.bak' not in f])
    for f in svg_files:
        print(f"  - {f}")
    print(f"\nTotal: {len(svg_files)} SVGs")
    
    print("\n" + "=" * 80)
    print("## 2. SCENE-BY-SCENE HOTSPOT ANALYSIS\n")
    
    for report in all_scene_reports:
        scene = report['scene']
        print(f"\n### {scene}")
        print(f"  SVG: {'YES' if report['has_svg'] else 'NO'}")
        if report.get('viewBox'):
            print(f"  ViewBox: {report['viewBox']} (w={report.get('vb_w')}, h={report.get('vb_h')})")
        if report.get('svg_ids'):
            print(f"  SVG IDs: {', '.join(report['svg_ids'][:20])}")
        print(f"  Hotspots: {report['hotspot_count']}")
        
        for hs in report['hotspots']:
            nav_tag = " [NAV]" if hs.get('is_nav') else ""
            vis_tag = ""
            if hs.get('is_nav'):
                vis_tag = " [HAS_VISUAL]" if hs.get('nav_has_visual') else " [NO_VISUAL_INDICATOR]"
            
            print(f"\n    [{hs.get('id', '?')}] \"{hs.get('name', '?')}\"{nav_tag}{vis_tag}")
            print(f"      Current:  x={hs.get('x')}, y={hs.get('y')}, w={hs.get('width')}, h={hs.get('height')}")
            
            if hs.get('svg_match') and hs['svg_match'] != 'NO_MATCH':
                me = hs.get('matched_element', {})
                print(f"      SVG Match: {hs['svg_match']} -> <{me.get('tag')}> id=\"{me.get('id', '')}\"")
            else:
                print(f"      SVG Match: NONE")
            
            if hs.get('expected_x') is not None:
                print(f"      Expected: x={hs['expected_x']}, y={hs['expected_y']}, w={hs.get('expected_w')}, h={hs.get('expected_h')}")
            
            if hs.get('delta_x') is not None:
                print(f"      Deltas:   dx={hs['delta_x']}, dy={hs['delta_y']}, dw={hs.get('delta_w')}, dh={hs.get('delta_h')}")
            
            align = hs.get('alignment', 'UNKNOWN')
            print(f"      Status:   {align}")
    
    print("\n" + "=" * 80)
    print("## 3. NAVIGATION/BACK HOTSPOTS SUMMARY\n")
    
    for nh in all_nav_hotspots:
        vis = "HAS VISUAL" if nh['has_visual'] else "NO VISUAL"
        print(f"  [{nh['scene']}] id={nh['id']} name=\"{nh['name']}\" ({nh['x']},{nh['y']} {nh['w']}x{nh['h']}) -> {vis}")
    
    print(f"\n  Total nav hotspots: {len(all_nav_hotspots)}")
    print(f"  With visual indicators: {sum(1 for n in all_nav_hotspots if n['has_visual'])}")
    print(f"  Without visual indicators: {sum(1 for n in all_nav_hotspots if not n['has_visual'])}")
    
    print("\n" + "=" * 80)
    print("## 4. MISALIGNMENT ISSUES & SUGGESTED FIXES\n")
    
    if all_issues:
        for issue in all_issues:
            print(f"  FILE: {issue['file']}")
            print(f"  HOTSPOT: id={issue['hotspot_id']}, name=\"{issue['hotspot_name']}\"")
            print(f"  SVG ELEMENT: {issue['matched_svg_element']}")
            print(f"  CURRENT:   {issue['current']}")
            print(f"  SUGGESTED: {issue['suggested']}")
            print()
    else:
        print("  No clear misalignments detected via automated matching.")
        print("  (Note: many hotspots could not be auto-matched to SVG elements)")


if __name__ == '__main__':
    main()
