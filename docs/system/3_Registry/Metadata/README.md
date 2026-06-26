# Metadata Registry  
### Descriptive Identity Layer for All Objects in NoLLM

The **Metadata** subsystem defines the *descriptive identity* of every object in the NoLLM architecture.  
Where SKUs define *what* an object is, and Coordinates define *where* it is, Metadata defines:

- **how the object should be described**
- **what anchors it carries**
- **what continuity rules apply**
- **what properties it exposes**
- **how it participates in the system**

Metadata is the **descriptive backbone** of NoLLM.

---

# 1. Purpose of the Metadata Registry

Metadata ensures:

- **stable descriptive identity**  
- **consistent anchors** (identity, continuity, stability)  
- **non‑drifting properties**  
- **alignment with SKUs and Coordinates**  
- **literal, non‑inferential descriptions**  
- **structural clarity** for UI, routing, and world objects  

Metadata is the *descriptive contract* that prevents ambiguity.

---

# 2. Files in This Folder

Metadata/
metadata.schema.json
metadata_objects.json
anchors.json
continuity.json
metadata_type.json
metadata_invariants.md


Each file plays a distinct role.

---

# 3. metadata.schema.json

Defines the **shape** of every metadata entry:

id: string
name: string
sku: string
coordinates: string
type: string
category: string

anchors:
identity: string
continuity: string
stability: string

properties:
key: value


This schema ensures:

- consistent structure  
- predictable fields  
- stable descriptive identity  

---

# 4. metadata_objects.json

This is the **master list** of metadata for all objects in the system.

Each entry defines:

- **id** — metadata ID  
- **name** — canonical name  
- **sku** — SKU reference  
- **coordinates** — coordinate reference  
- **type** — object type (container, structure, module, ui, etc.)  
- **category** — semantic grouping  
- **anchors** — identity, continuity, stability  
- **properties** — literal descriptive fields  

This file includes metadata for:

### World-plane containers  
- meta_world_root  
- meta_districts  
- meta_tower  
- meta_field  
- meta_collapse  
- meta_adjacency  
- meta_invariants  

### Hotel-plane containers  
- meta_hotel  
- meta_floor_01 / 02 / 03  

### Room-plane containers  
- meta_guest_room_f01 / f02 / f03  
- meta_llm_room_f01  
- meta_bridge_room_f02  
- meta_nollm_room_f03  

### Circulation  
- meta_hallway_floor_01  
- meta_stairwell_01_02  
- meta_elevator_core  

### Structural skeletons  
- meta_floor_skeleton  
- meta_room_skeleton  

### Modules  
- meta_module_echo  
- meta_module_validate  
- meta_module_null  
- meta_module_passthrough  
- meta_module_identity  

### Validators  
- meta_validator_schema  
- meta_validator_invariants  

### Routing  
- meta_routing_node  

### UI surfaces, layers, styles, animations, errors  
- meta_surface_architecture  
- meta_map_layer_base  
- meta_map_style_colors  
- meta_map_anim_fade_in  
- meta_error_invalid_node  
- …and many more  

### Service objects  
- meta_lobby  
- meta_front_desk  
- meta_directory  
- meta_vending_machine  
- meta_bulletin_board  
- meta_district_door  
- meta_map_sign  

### Service behaviors  
- meta_concierge_behavior_navigate  
- meta_directory_behavior_lookup  
- meta_vending_behavior_dispense  
- meta_bulletin_behavior_post  

### Anchors  
- meta_anchor_reflective_mode  
- meta_anchor_avoid_drift  
- meta_anchor_steady_stance  

### Notepad  
- meta_coat_room_notepad  

This file is the **authoritative descriptive registry** for all objects.

---

# 5. anchors.json

Defines the **allowed anchor vocabulary**:

- identity anchors  
- continuity anchors  
- stability anchors  

Examples:

identity: ["hotel", "guest_room", "ui_map_node", ...]
continuity: ["stable", "volatile", "fixed", "template", "omnipresent", "user_authored", "ephemeral"]
stability: ["very_high", "high", "medium", "low"]


Anchors ensure that metadata remains:

- structurally correct  
- semantically consistent  
- non‑drifting  

---

# 6. continuity.json

Defines the **meaning** of each continuity state.

Examples:

- `stable` → persists across sessions  
- `volatile` → may reset  
- `fixed` → immutable  
- `template` → used for instantiation  
- `omnipresent` → exists across all scenes  
- `user_authored` → must not be altered  
- `ephemeral` → exists only during transient states  

Continuity rules prevent:

- inference  
- auto‑summaries  
- semantic drift  
- unauthorized modification  

---

# 7. metadata_type.json

Defines **allowed metadata categories** and their required fields.

Examples:

world → anchors + properties
floor → anchors + properties
room → anchors + properties
circulation → anchors + properties
module → anchors + properties
ui → anchors + properties
ui_layer → anchors + properties
service → anchors + properties
service_behavior → anchors + properties
anchor → anchors + properties
notepad → anchors + properties


This ensures that metadata categories remain:

- consistent  
- predictable  
- structurally aligned  

---

# 8. metadata_invariants.md

Defines the **rules that must always hold** for metadata.

Invariants include:

### Identity invariants  
- metadata IDs must be unique  
- metadata name must match canonical name  
- metadata must reference a valid SKU  
- metadata must reference a valid coordinate  

### Anchor invariants  
- identity anchor must match object identity  
- continuity must be allowed  
- stability must be allowed  

### Category invariants  
- category must match metadata_type.json  
- category must not drift  

### Property invariants  
- properties must be literal  
- no inference  
- no prediction  
- no semantic expansion  

### Coordinate invariants  
- coordinates must match SKU coordinates  

### Integrity invariants  
- no orphaned metadata  
- no contradictions with naming, coordinates, or SKUs  

These invariants keep metadata **clean, stable, and non‑drifting**.

---

# 9. How Metadata Interacts With Other Registry Subsystems

Metadata binds together:

### Naming  
- name must match canonical name  

### SKUs  
- metadata.sku must match SKU identity  

### Coordinates  
- metadata.coordinates must match coordinate identity  

### Routing  
- routing nodes use metadata to determine behavior  

### World  
- world objects store metadata in `metadata.json`  

### Engine  
- validators enforce metadata invariants  
- modules use metadata to determine behavior  

Metadata is the **descriptive glue** of the system.

---

# 10. Adding or Modifying Metadata

To add a new metadata object:

1. Add an entry to `metadata_objects.json`  
2. Validate it against `metadata.schema.json`  
3. Ensure anchors match `anchors.json`  
4. Ensure continuity rules match `continuity.json`  
5. Ensure category matches `metadata_type.json`  
6. Ensure invariants in `metadata_invariants.md` are satisfied  
7. Ensure SKU and Coordinates are already defined  

The Engine will automatically interpret the new metadata.

---

# 11. Mental Model Summary

- **metadata_objects.json** → descriptive identity  
- **metadata.schema.json** → structure  
- **anchors.json** → allowed anchor vocabulary  
- **continuity.json** → continuity rules  
- **metadata_type.json** → allowed categories  
- **metadata_invariants.md** → global rules  

Metadata ensures that NoLLM remains:

- literal  
- stable  
- structured  
- non‑drifting  
- identity‑consistent  

This folder is the **descriptive contract** of the system.

