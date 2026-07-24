# SKU Registry  
### Stable Identity Keys for All Objects in NoLLM

The **SKU subsystem** defines the *stable, unique identity keys* for every object in the NoLLM architecture.  
A SKU binds together:

- a **canonical name**  
- a **coordinate**  
- a **metadata object**  
- a **category**  
- a **version**  

SKUs are the **cross‑plane identity anchors** that allow the Engine, World, Registry, and Semantics to reference the same object deterministically.

---

# 1. Purpose of the SKU Registry

SKUs ensure:

- **global uniqueness**  
- **stable identity across updates**  
- **consistent mapping** between naming, coordinates, and metadata  
- **non‑drifting references** across all planes  
- **versioned evolution** of objects  

A SKU is the *single source of truth* for “what object is this?”

---

# 2. Files in This Folder

SKUs/
sku.schema.json
sku_namespace.json
sku_invariants.md
sku_metadata_map.json
sku_to_object_map.json


Each file plays a distinct role.

---

# 3. sku.schema.json

Defines the **shape** of every SKU entry:

sku: string
object_id: string
coordinates: string
metadata: string
category: string
version: string


This schema ensures:

- consistent structure  
- predictable fields  
- stable identity definitions  

---

# 4. sku_namespace.json

This is the **master list** of all SKUs in the system.

Each entry defines:

- `sku` — the unique identity key  
- `object_id` — canonical name ID  
- `coordinates` — coordinate ID  
- `metadata` — metadata ID  
- `category` — object category  
- `version` — version anchor  

This file includes SKUs for:

### World-plane containers  
- WORLD‑0001  
- WORLD‑DISTRICTS‑0001  
- WORLD‑TOWER‑0001  
- WORLD‑FIELD‑0001  
- WORLD‑COLLAPSE‑0001  
- WORLD‑ADJACENCY‑0001  
- WORLD‑INVARIANTS‑0001  

### Hotel-plane containers  
- HOTEL‑0001  
- HOTEL‑FLOOR‑0001 / 0002 / 0003  

### Room-plane objects  
- ROOM‑GUEST‑F01 / F02 / F03  
- ROOM‑LLM‑F01  
- ROOM‑BRIDGE‑F02  
- ROOM‑NOLLM‑F03  

### Circulation  
- CIRC‑HALLWAY‑F01 / F02 / F03  
- CIRC‑STAIR‑01‑02 / 02‑03  
- CIRC‑ELEV‑CORE‑01 / 02 / 03  

### Structural skeletons  
- SKEL‑FLOOR‑0001  
- SKEL‑ROOM‑0001  

### Modules  
- MOD‑ECHO‑0001  
- MOD‑VALIDATE‑0001  
- MOD‑NULL‑0001  
- MOD‑PASSTHROUGH‑0001  
- MOD‑IDENTITY‑0001  
- MOD‑ROUTETEST‑0001  

### Validators  
- VAL‑SCHEMA‑0001  
- VAL‑INVARIANTS‑0001  

### Routing  
- ROUTING‑NODE‑0001  

### UI surfaces, layers, edges, scenes, transitions  
- SURF‑ARCH‑0001  
- UI‑ROOT‑0001  
- UI‑MAPNODE‑0001  
- MAP‑LAYER‑BASE‑0001  
- MAP‑STYLE‑COLOR‑0001  
- MAP‑ANIM‑FADEIN‑0001  
- MAP‑ERROR‑INVALID‑0001  
- HOTEL‑SCENE‑DOOR‑0001  
- HOTEL‑TRANS‑MAP2DOOR‑0001  
- …and many more  

### Service objects  
- SERV‑LOBBY‑0001  
- SERV‑FRONTDESK‑0001  
- SERV‑DIRECTORY‑0001  
- SERV‑VENDING‑0001  
- SERV‑BULLETIN‑0001  
- SERV‑DISTDOOR‑0001  
- SERV‑MAPSIGN‑0001  

### Service behaviors  
- CONC‑NAV‑0001  
- DIR‑LOOKUP‑0001  
- VEND‑STATUS‑0001  
- BULL‑POST‑0001  

### Anchors  
- ARCH‑REFLECT‑0001  
- ARCH‑DRIFT‑0001  
- ARCH‑STEADY‑0001  

### Notepad  
- NOTEPAD‑COATROOM‑0001  

This file is the **authoritative identity registry** for all objects.

---

# 5. sku_invariants.md

Defines the **rules that must always hold** for SKUs.

Invariants include:

### Identity invariants  
- SKUs must be globally unique  
- SKUs must be stable  
- SKUs must map to exactly one object  

### Object mapping invariants  
- `object_id` must reference a canonical name  
- `coordinates` must reference a coordinate  
- `metadata` must reference a metadata object  

### Category invariants  
- category must match the object’s true type  
- world → container  
- floors → floor  
- rooms → room  
- circulation → circulation  
- modules → module  
- UI → ui / ui_edge / ui_layer / ui_style / ui_animation / ui_error / ui_scene / ui_transition / ui_interaction / ui_state_machine / ui_accessibility  

### Coordinate invariants  
- spatial objects must have numeric coordinates  
- abstract objects must have null coordinates  

### Metadata invariants  
- metadata must match the object’s category  

### Versioning invariants  
- version strings must follow `v<number>`  
- versions must increase monotonically  

These invariants keep the SKU system **clean, stable, and non‑drifting**.

---

# 6. sku_metadata_map.json

Defines **which metadata schemas** each SKU category requires.

Examples:

- `room` → guest room metadata, LLM room metadata, bridge room metadata  
- `circulation` → hallway, stairwell, elevator metadata  
- `module` → module metadata  
- `ui_layer` → map layer metadata  
- `ui_style` → style metadata  
- `service` → lobby, front desk, directory, vending, bulletin, district door metadata  

This file ensures that every SKU has the **correct metadata** for its category.

---

# 7. sku_to_object_map.json

A **flat dictionary** mapping:

SKU → canonical object_id


Used for:

- fast lookup  
- reverse resolution  
- routing  
- UI map rendering  
- world object instantiation  

This file ensures that every SKU resolves to a **real, valid object**.

---

# 8. How SKUs Interact With Other Registry Subsystems

SKUs bind together:

### Naming  
- object_id → canonical name  

### Coordinates  
- coordinates → spatial or abstract identity  

### Metadata  
- metadata → descriptive fields  

### Routing  
- routing nodes use SKUs for transitions  

### World  
- world objects store a SKU in `sku.txt`  

### Engine  
- validators enforce SKU invariants  
- modules use SKU category to determine behavior  

SKUs are the **cross‑plane glue** of the system.

---

# 9. Adding or Modifying SKUs

To add a new SKU:

1. Add an entry to `sku_namespace.json`  
2. Validate it against `sku.schema.json`  
3. Add its metadata to the Metadata registry  
4. Add its coordinate to the Coordinates registry  
5. Add its canonical name to the Naming registry  
6. Add its mapping to `sku_to_object_map.json`  
7. Ensure all invariants in `sku_invariants.md` are satisfied  

The Engine will automatically interpret the new SKU.

---

# 10. Mental Model Summary

- **sku_namespace.json** → the identity list  
- **sku.schema.json** → the structure  
- **sku_invariants.md** → the rules  
- **sku_metadata_map.json** → required metadata  
- **sku_to_object_map.json** → reverse lookup  

SKUs ensure that NoLLM remains:

- deterministic  
- identity‑consistent  
- modular  
- non‑drifting  
- versioned  

This folder is the **identity contract** of the system.


