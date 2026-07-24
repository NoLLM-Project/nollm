function build_chunks(atoms):

    chunks = []
    i = 0

    while i < len(atoms):
        a = atoms[i]

        if is_F_PREP(a):
            # PREP_CHUNK: F_PREP + (N | P | UNKNOWN)
            if i + 1 < len(atoms) and (is_N(atoms[i+1]) or is_P(atoms[i+1]) or is_UNKNOWN(atoms[i+1])):
                chunk_atoms = [a, atoms[i+1]]
                chunks.append(new_chunk("PREP", chunk_atoms))
                i += 2
            else:
                chunks.append(new_chunk("PREP", [a]))
                i += 1

        elif is_F_CONNECTIVE(a):
            # CONN_CHUNK: F_CONNECTIVE (+ D)?
            if i + 1 < len(atoms) and is_D(atoms[i+1]):
                chunk_atoms = [a, atoms[i+1]]
                chunks.append(new_chunk("CONN", chunk_atoms))
                i += 2
            else:
                chunks.append(new_chunk("CONN", [a]))
                i += 1

        elif is_D(a):
            # ADV_CHUNK or NOUN_PREFIX start
            if i + 1 < len(atoms) and (is_D(atoms[i+1]) or is_J(atoms[i+1]) or is_N(atoms[i+1])):
                # treat as NOUN_PREFIX if followed by J/N
                j = i
                prefix_atoms = []
                while j < len(atoms) and (is_D(atoms[j]) or is_J(atoms[j])):
                    prefix_atoms.append(atoms[j])
                    j += 1
                if j < len(atoms) and is_N(atoms[j]):
                    prefix_atoms.append(atoms[j])
                    chunks.append(new_chunk("NOUN", prefix_atoms))
                    i = j + 1
                else:
                    chunks.append(new_chunk("ADV", [a]))
                    i += 1
            else:
                chunks.append(new_chunk("ADV", [a]))
                i += 1

        elif is_J(a):
            # NOUN_PREFIX: (D|J)* + N
            j = i
            prefix_atoms = []
            while j < len(atoms) and (is_D(atoms[j]) or is_J(atoms[j])):
                prefix_atoms.append(atoms[j])
                j += 1
            if j < len(atoms) and is_N(atoms[j]):
                prefix_atoms.append(atoms[j])
                chunks.append(new_chunk("NOUN", prefix_atoms))
                i = j + 1
            else:
                chunks.append(new_chunk("UNKNOWN", prefix_atoms))
                i = j

        elif is_N(a):
            chunks.append(new_chunk("NOUN", [a]))
            i += 1

        elif is_P(a):
            chunks.append(new_chunk("P_PHRASE", [a]))
            i += 1

        elif is_UNKNOWN(a):
            chunks.append(new_chunk("UNKNOWN", [a]))
            i += 1

    return chunks
