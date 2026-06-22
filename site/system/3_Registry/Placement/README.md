# Placement Registry  
### Spatial, Structural, and Plane Placement Rules for NoLLM

The **Placement** subsystem defines *where objects are allowed to exist* within the NoLLM architecture.  
It establishes:

- **allowed parents**  
- **allowed children**  
- **inside/outside constraints**  
- **adjacency constraints**  
- **placement invariants**  

Placement is the **structural backbone** of the world, hotel, UI, and operational planes.

---

# 1. Purpose of the Placement Registry

Placement ensures:

- **structural correctness**  
- **non‑drifting spatial rules**  
- **clear containment hierarchy**  
- **plane separation** (world vs hotel vs UI vs operational)  
- **floor‑specific constraints** (LLM‑only, shared, NoLLM‑only)  
- **service‑plane isolation**  
- **UI‑plane isolation**  
- **no illegal nesting**  

Placement is the *structural contract* that prevents ambiguity.

---

# 2. Files in This Folder

Placement/
placement.schema.json
world_placement.json
hotel_placement.json
llm_floor_placement.json
bridge_placement.json
nollm_floor_placement.json
service_placement.json
ui_placement.json
operational_placement.json
placement_invariants.md


Each file defines placement rules for a specific plane or subsystem.

---

# 3. placement.schema.json

Defines the **shape** of every placement rule:

id: string
object_id: string
allowed_parents: [string]
allowed_children: [string]

constraints:
must_be_adjacent_to: [string]
cannot_be_adjacent_to: [string]
must_be_inside: [string]
cannot_be_inside: [string]

invariants: [string]


This schema ensures:

- consistent structure  
- predictable fields  
- stable placement definitions  

---

# 4. world_placement.json

Defines placement for **world‑plane containers**.

Example:

- `world_root` is top‑level  
- world_root may contain:
  - districts  
  - hotel  
  - tower  
  - field  
  - collapse  
  - adjacency  
  - world_invariants  

Invariant:

- `world_is_top_level`

This file establishes the **outermost containment hierarchy**.

---

# 5. hotel_placement.json

Defines placement for the **hotel structure**:

- hotel must be inside world  
- hotel must contain floors  
- floors must contain rooms and circulation  
- circulation must not host rooms  
- stairwells/elevators must connect floors  
- hotel_shell must contain hotel  

Invariants include:

- `hotel_must_have_at_least_one_floor`  
- `floor_must_have_rooms`  
- `circulation_paths_do_not_host_rooms`  
- `shell_contains_hotel`  

This file defines the **core hotel geometry**.

---

# 6. llm_floor_placement.json

Defines placement for **Floor 01 (LLM‑only)**:

- floor_01 must be inside hotel  
- llm_room must be inside floor_01  
- llm_room cannot appear on floors 02 or 03  

Invariants:

- `llm_floor_is_llm_only`  
- `llm_rooms_only_on_floor_01`  

This file enforces **LLM‑only containment**.

---

# 7. bridge_placement.json

Defines placement for **Floor 02 (shared)**:

- floor_02 must be inside hotel  
- bridge_room must be inside floor_02  
- bridge_room cannot appear on floors 01 or 03  

Invariants:

- `bridge_floor_is_shared`  
- `bridge_rooms_only_on_floor_02`  

This file enforces **shared‑plane containment**.

---

# 8. nollm_floor_placement.json

Defines placement for **Floor 03 (NoLLM‑only)**:

- floor_03 must be inside hotel  
- nollm_room must be inside floor_03  
- nollm_room cannot appear on floors 01 or 02  

Invariants:

- `nollm_floor_is_nollm_only`  
- `nollm_rooms_only_on_floor_03`  

This file enforces **NoLLM‑only containment**.

---

# 9. service_placement.json

Defines placement for **hotel service objects**:

- lobby must be inside hotel  
- service objects must be inside lobby  
- service behaviors must be inside their service object  
- coat_room must contain anchors and notepad  

Invariants include:

- `lobby_is_entry_point`  
- `directory_behaviors_are_service_plane`  
- `vending_behaviors_are_service_plane`  
- `bulletin_behaviors_are_service_plane`  
- `coat_room_contains_anchors`  
- `notepad_is_user_authored`  

This file defines the **service plane**.

---

# 10. ui_placement.json

Defines placement for **UI‑plane objects**:

- UI objects must not appear in the world  
- ui_root is the top‑level UI container  
- UI panels, sections, edges, layers, styles, animations, errors, scenes, transitions must be inside ui_root  
- district door scenes and transitions must remain in UI plane  

Invariants include:

- `ui_objects_are_not_world_objects`  
- `map_layers_are_ui_plane`  
- `map_styles_are_ui_plane`  
- `state_machine_is_ui_plane`  
- `scene_is_hotel_plane`  
- `transition_is_boundary_only`  

This file defines the **UI plane**.

---

# 11. operational_placement.json

Defines placement for **modules, validators, routing nodes**:

- modules must not appear in the world  
- validators must not appear in the world  
- routing nodes must not appear in the world  

Invariants:

- `modules_are_not_world_objects`  
- `validators_are_not_world_objects`  
- `routing_nodes_are_not_world_objects`  

This file defines the **operational plane**.

---

# 12. placement_invariants.md

Defines the **rules that must always hold** for placement.

Invariants include:

### Identity invariants  
- placement IDs must be unique  
- object_id must reference a canonical name  

### Spatial invariants  
- world_root is top‑level  
- hotel_shell contains hotel  
- hotel contains floors  
- floors contain rooms and circulation  
- rooms do not contain rooms  
- skeletons are not instances  

### Floor invariants  
- Floor 01 → LLM‑only  
- Floor 02 → shared  
- Floor 03 → NoLLM‑only  

### Service invariants  
- lobby contains service objects  
- service behaviors remain in service plane  

### UI invariants  
- UI objects remain in UI plane  
- UI transitions remain in UI plane  

### Operational invariants  
- modules, validators, routing nodes remain outside world  

### Integrity invariants  
- no cycles  
- no illegal nesting  
- no contradictions with naming, coordinates, metadata, or SKUs  

These invariants keep placement **clean, stable, and non‑drifting**.

---

# 13. How Placement Interacts With Other Registry Subsystems

Placement binds together:

### Naming  
- object_id must match canonical name  

### Coordinates  
- placement must match coordinate plane  

### Metadata  
- metadata category must match placement plane  

### SKUs  
- SKU category must match placement plane  

### Routing  
- routing transitions must respect placement constraints  

### World  
- world objects are instantiated according to placement rules  

Placement is the **structural glue** of the system.

---

# 14. Adding or Modifying Placement Rules

To add a new placement rule:

1. Add an entry to the appropriate placement file  
2. Validate it against `placement.schema.json`  
3. Ensure invariants in `placement_invariants.md` are satisfied  
4. Ensure constraints do not contradict:
   - naming  
   - coordinates  
   - metadata  
   - SKUs  
   - routing  

The Engine will automatically interpret the new placement rule.

---

# 15. Mental Model Summary

- **placement.schema.json** → structure  
- **world_placement.json** → world plane  
- **hotel_placement.json** → hotel plane  
- **llm_floor_placement.json** → LLM‑only floor  
- **bridge_placement.json** → shared floor  
- **nollm_floor_placement.json** → NoLLM‑only floor  
- **service_placement.json** → service plane  
- **ui_placement.json** → UI plane  
- **operational_placement.json** → operational plane  
- **placement_invariants.md** → global rules  

Placement ensures that NoLLM remains:

- structurally sound  
- plane‑separated  
- deterministic  
- non‑drifting  
- identity‑consistent  

This folder is the **structural contract** of the system.
