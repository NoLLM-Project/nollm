# Naming Registry  
### Canonical Identity, Aliasing, and Structural Rules for NoLLM

The Naming Registry defines the canonical identity vocabulary for the NoLLM architecture.  
It provides stable names, alias mappings, and structural rules used across all subsystems.

---

## Files

canonical_names.json
alias.json
naming.schema.json
naming_invariants.json

---

## canonical_names.json

A pure JSON array.  
Each entry includes:

- `id`
- `canonical_name`
- `aliases` (always `[]`)
- `type`
- `layer`
- `description`

This file defines all canonical identities across world-plane, hotel-plane, floor-plane, room-plane, and primitive categories.

---

## alias.json

A flat JSON object mapping:

alias → canonical ID

Rules:

- `summarize_text` defines natural‑language aliases.
- All other guest‑invokable rooms receive a placeholder entry:

"": "room_id"

This prevents alias‑resolution errors and maintains stability.

---

## naming.schema.json

Defines the required structure for each canonical naming entry:

id: string
canonical_name: string
aliases: [string]
type: string
layer: string
description: string

Ensures structural consistency.

---

## naming_invariants.json

A machine‑readable JSON file defining the invariants that must hold across the Naming Registry.

It includes:

- canonical name invariants  
- alias invariants  
- allowed types (original + expanded current types)  
- allowed layers (original + expanded current layers)  
- description rules  
- registry integrity rules  
- enforcement rules  

The invariants file is authoritative for:

- allowed types  
- allowed layers  
- alias behavior  
- description constraints  
- registry validation  

These invariants ensure the naming system remains stable, literal, and non‑drifting.

---

## Mental Model

- **canonical_names.json** → vocabulary  
- **alias.json** → alias lookup  
- **naming.schema.json** → structural contract  
- **naming_invariants.json** → governing rules  

Naming provides the stable identity layer for the entire NoLLM architecture.

