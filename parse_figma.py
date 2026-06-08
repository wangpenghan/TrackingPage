import json

with open('figma-api-response.json', 'rb') as f:
    raw = f.read()

# Detect BOM or other encoding
print(f"File size: {len(raw)} bytes")
print(f"First bytes (hex): {raw[:20].hex()}")

# Try reading as utf-8-sig or utf-16
for enc in ['utf-8-sig', 'utf-16', 'latin-1']:
    try:
        text = raw.decode(enc)
        d = json.loads(text)
        err = d.get('err', None)
        if err:
            print(f"Error from API: {err}")
            print(f"Status: {d.get('status')}")
        else:
            print(f"Success with encoding: {enc}")
            nodes = d.get('nodes', {})
            for nid, ndata in nodes.items():
                doc = ndata.get('document', {})
                name = doc.get('name', 'unknown')
                print(f'=== Node {nid}: {name} ===')
                print(f'  Type: {doc.get("type")}')
                children = doc.get('children', [])
                print(f'  Children count: {len(children)}')
                for i, child in enumerate(children):
                    ctype = child.get('type')
                    cname = child.get('name')
                    print(f'    [{i}] {ctype}: {cname}')
                    sub_children = child.get('children', [])
                    for j, sub in enumerate(sub_children):
                        stype = sub.get('type')
                        sname = sub.get('name')
                        print(f'      [{j}] {stype}: {sname}')
                print()
        break
    except Exception as e:
        print(f"  {enc}: {e}")

print("\n--- First 1000 chars of content ---")
try:
    text = raw.decode('utf-8-sig')
    print(text[:1000])
except:
    pass