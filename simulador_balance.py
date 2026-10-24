"""Simulacion estructural de Barrio en Venta v1.0.

No pretende jugar como una persona experta. Sirve para detectar estrategias
dominadas, ventaja de asiento, duracion y categorias de cierre imposibles.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import random
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path


CATEGORIES = ("Lujosa", "Media", "Barata")
PROGRESS = {
    "Lujosa": [3, 4, 5, 6, 8],
    "Media": [1, 2, 3, 4, 6],
    "Barata": [0, 1, 2, 3, 5],
}
STRATEGIES = ("lujo", "equilibrio", "volumen", "bloqueo")


@dataclass
class Tile:
    name: str
    kind: str
    category: str = ""
    base: int = 0
    traits: tuple[str, ...] = ()
    sold_by: int | None = None
    priority: int | None = None
    paperwork: bool = False


@dataclass(frozen=True)
class Client:
    name: str
    accepts: tuple[str, ...]
    wants: tuple[str, ...]
    reward: int = 2
    penalty: int = -1
    cap: int = 6


@dataclass
class Player:
    strategy: str
    score: int = 0
    sales: Counter = field(default_factory=Counter)
    priorities_left: int = 4
    clients: list[Client] = field(default_factory=list)
    agency: int = 2
    sale_values: list[int] = field(default_factory=list)
    objective: str = ""


def build_tiles() -> list[Tile]:
    homes = [
        Tile("Atico con terraza", "home", "Lujosa", 6, ("Exclusiva", "Centrica")),
        Tile("Chalet con jardin", "home", "Lujosa", 6, ("Familiar", "Tranquila")),
        Tile("Duplex reformado", "home", "Lujosa", 5, ("Exclusiva", "Reformada")),
        Tile("Piso senorial", "home", "Lujosa", 5, ("Exclusiva", "Centrica")),
        Tile("Villa discreta", "home", "Lujosa", 6, ("Tranquila", "Exclusiva")),
        Tile("Loft de autor", "home", "Lujosa", 5, ("Centrica", "Reformada")),
        Tile("Casa modernista", "home", "Lujosa", 5, ("Exclusiva", "Familiar")),
        Tile("Piso familiar", "home", "Media", 4, ("Familiar", "Tranquila")),
        Tile("Piso cerca del metro", "home", "Media", 4, ("Centrica", "Conexion")),
        Tile("Apartamento luminoso", "home", "Media", 4, ("Centrica", "Reformada")),
        Tile("Casa adosada", "home", "Media", 4, ("Familiar", "Tranquila")),
        Tile("Piso con balcon", "home", "Media", 3, ("Centrica", "Tranquila")),
        Tile("Vivienda reformada", "home", "Media", 4, ("Reformada", "Familiar")),
        Tile("Piso de barrio", "home", "Media", 3, ("Familiar", "Conexion")),
        Tile("Estudio centrico", "home", "Barata", 2, ("Centrica", "Inversion")),
        Tile("Piso a reformar", "home", "Barata", 2, ("Reformable", "Inversion")),
        Tile("Bajo interior", "home", "Barata", 1, ("Barata", "Inversion")),
        Tile("Apartamento pequeno", "home", "Barata", 2, ("Centrica", "Barata")),
        Tile("Piso de oportunidad", "home", "Barata", 2, ("Inversion", "Reformable")),
        Tile("Vivienda heredada", "home", "Barata", 2, ("Barata", "Familiar")),
        Tile("Local reconvertido", "home", "Barata", 1, ("Inversion", "Reformable")),
    ]
    services = ["Parque", "Parque", "Colegio", "Metro", "Metro", "Hospital", "Comercio", "Ocio", "Reforma urbana"]
    incidents = ["Obras", "Obras", "Ruido", "Impuestos altos", "Litigio", "Mala conexion"]
    return homes + [Tile(x, "service") for x in services] + [Tile(x, "incident") for x in incidents]


def build_clients() -> list[Client]:
    raw = [
        ("Familia con dos ninos", "ML", "Familiar Colegio Parque", 2, -2, 6),
        ("Madre practica", "BM", "Colegio Comercio Conexion", 2, -1, 5),
        ("Familia que crece", "ML", "Familiar Parque Tranquila", 2, -2, 6),
        ("Padres primerizos", "M", "Hospital Colegio Tranquila", 2, -2, 4),
        ("Pareja joven", "BM", "Metro Ocio Centrica", 2, -1, 5),
        ("Profesional sin tiempo", "ML", "Metro Comercio Reformada", 2, -2, 5),
        ("Amantes del centro", "BML", "Centrica Ocio Comercio", 2, -1, 6),
        ("Reubicacion express", "BML", "", 1, 0, 1),
        ("Inversor de alquiler", "BM", "Inversion Metro", 3, -1, 5),
        ("Cazador de gangas", "B", "Reformable Reforma_urbana", 3, 0, 5),
        ("Fondo discreto", "ML", "Inversion Centrica Comercio", 2, -2, 5),
        ("Comprador oportunista", "BM", "Incidencia", 4, -2, 4),
        ("Directiva internacional", "L", "Exclusiva Metro Comercio", 2, -2, 6),
        ("Matrimonio reservado", "L", "Tranquila Parque Hospital", 2, -3, 7),
        ("Cliente de capricho", "L", "Exclusiva Servicio Servicio", 2, -3, 6),
        ("Comprador de prestigio", "ML", "Exclusiva Reforma_urbana Centrica", 2, -2, 6),
        ("Jubilados activos", "M", "Hospital Parque Comercio", 2, -2, 5),
        ("Teletrabajador", "BM", "Tranquila Parque", 3, -3, 5),
        ("Escritora", "BML", "Tranquila Parque", 2, -2, 4),
        ("Pareja con perro", "BM", "Parque Tranquila Comercio", 2, -1, 5),
        ("Cliente indeciso", "BML", "Servicio Rasgo", 2, -2, 3),
        ("Cliente recomendado", "BML", "Prioridad", 3, 0, 3),
        ("Hipoteca justa", "BM", "Barata Comercio", 2, -2, 4),
        ("Cliente emocional", "BML", "Servicio Servicio", 2, -2, 4),
    ]
    code = {"L": "Lujosa", "M": "Media", "B": "Barata"}
    return [Client(n, tuple(code[x] for x in a), tuple(w.split()), r, p, c) for n, a, w, r, p, c in raw]


def coords_radius_three() -> list[tuple[int, int]]:
    coords = []
    for q in range(-3, 4):
        for r in range(-3, 4):
            if max(abs(q), abs(r), abs(-q-r)) <= 3 and (q, r) != (0, 0):
                coords.append((q, r))
    return coords


DIRS = ((1, 0), (1, -1), (0, -1), (-1, 0), (-1, 1), (0, 1))


def neighbors(pos: tuple[int, int]) -> list[tuple[int, int]]:
    return [(pos[0] + dq, pos[1] + dr) for dq, dr in DIRS]


def adjacency_features(pos, board, revealed) -> list[str]:
    features = []
    for n in neighbors(pos):
        if n not in revealed or n not in board:
            continue
        tile = board[n]
        if tile.kind == "service":
            features.append(tile.name.replace(" ", "_"))
            features.append("Servicio")
        elif tile.kind == "incident":
            features.extend((tile.name.replace(" ", "_"), "Incidencia"))
    return features


def client_points(client: Client, tile: Tile, features: list[str], has_priority: bool) -> int:
    available = list(tile.traits) + features
    if has_priority:
        available.append("Prioridad")
    hits = 0
    pool = list(available)
    for want in client.wants:
        if want == "Rasgo" and tile.traits:
            hits += 1
        elif want in pool:
            hits += 1
            pool.remove(want)
    if not client.wants:
        return 1
    value = min(client.cap, hits * client.reward)
    return value if hits else client.penalty


def universal_neighborhood(tile: Tile, features: list[str], client: Client) -> int:
    points = 0
    points += features.count("Comercio")
    if "Reforma_urbana" in features:
        points += 1 + (2 if "Reformable" in tile.traits else 0)
    points -= 2 * features.count("Obras")
    if tile.category == "Lujosa" and "Impuestos_altos" in features:
        points -= 2
    if "Mala_conexion" in features and any(w in client.wants for w in ("Metro", "Conexion", "Ocio")):
        points -= 2
    return points


def category_weight(strategy: str, category: str, own: Player, rival: Player) -> float:
    base = {
        "lujo": {"Lujosa": 1.28, "Media": 0.98, "Barata": 0.92},
        "volumen": {"Lujosa": 0.80, "Media": 0.94, "Barata": 1.52},
        "equilibrio": {"Lujosa": 1.0, "Media": 1.03, "Barata": 1.0},
        "bloqueo": {"Lujosa": 0.95, "Media": 1.0, "Barata": 1.0},
    }[strategy][category]
    if strategy == "equilibrio":
        base *= 1.0 + 0.18 * (max(own.sales.values(), default=0) - own.sales[category])
    if strategy == "bloqueo":
        base *= 1.0 + 0.10 * rival.sales[category]
    if own.sales[category] == 4:
        base *= 1.55
    return base


def sale_options(pid, players, board, revealed, market):
    own, rival = players[pid], players[1-pid]
    options = []
    for pos in revealed:
        tile = board[pos]
        if tile.kind != "home" or tile.sold_by is not None or tile.priority == 1-pid:
            continue
        features = adjacency_features(pos, board, revealed)
        if "Litigio" in features and not tile.paperwork:
            continue
        for source, clients in (("private", own.clients), ("public", market)):
            for idx, client in enumerate(clients):
                if tile.category not in client.accepts:
                    continue
                progress_idx = own.sales[tile.category]
                progress = PROGRESS[tile.category][progress_idx] if progress_idx < 5 else 0
                raw = tile.base + progress + client_points(client, tile, features, tile.priority == pid)
                raw += universal_neighborhood(tile, features, client)
                weighted = raw * category_weight(own.strategy, tile.category, own, rival)
                if own.sales[tile.category] == 4:
                    weighted += 8
                options.append((weighted, raw, pos, source, idx))
    return sorted(options, reverse=True)


def draw_client(deck, rng):
    if not deck:
        deck.extend(build_clients())
        rng.shuffle(deck)
    return deck.pop()


def target_homes(pid, players, board, revealed, market):
    own, rival = players[pid], players[1-pid]
    choices = []
    for pos in revealed:
        tile = board[pos]
        if tile.kind != "home" or tile.sold_by is not None or tile.priority == pid:
            continue
        compatible = sum(tile.category in c.accepts for c in own.clients + market)
        weight = category_weight(own.strategy, tile.category, own, rival)
        denial = rival.sales[tile.category] * (1.5 if own.strategy == "bloqueo" else 0.35)
        priority_cost = 2.2 if tile.priority == 1-pid else 0
        luxury_need = 2.0 if tile.category == "Lujosa" else 0
        score = tile.base * weight + compatible * 2 + denial + luxury_need - priority_cost
        choices.append((score, pos))
    return sorted(choices, reverse=True)


def frontier(revealed, board):
    return [p for p in board if p not in revealed and any(n in revealed or n == (0, 0) for n in neighbors(p))]


def reveal_one(pid, players, board, revealed, rng):
    options = frontier(revealed, board)
    if not options:
        return False
    pos = rng.choice(options)
    revealed.add(pos)
    tile = board[pos]
    own = players[pid]
    if tile.kind == "home" and tile.priority is None and own.priorities_left:
        tile.priority = pid
        own.priorities_left -= 1
    return True


def reserve_best(pid, players, board, revealed, market):
    own = players[pid]
    for _, pos in target_homes(pid, players, board, revealed, market):
        tile = board[pos]
        if tile.priority == 1-pid:
            if own.agency <= 0 or own.priorities_left <= 0:
                continue
            own.agency -= 1
            players[1-pid].agency = min(5, players[1-pid].agency + 1)
            players[1-pid].priorities_left += 1
        elif own.priorities_left <= 0:
            return False
        tile.priority = pid
        own.priorities_left -= 1
        return True
    return False


def process_paperwork(pid, players, board, revealed, market):
    own = players[pid]
    candidates = []
    for pos in revealed:
        tile = board[pos]
        features = adjacency_features(pos, board, revealed)
        if tile.kind == "home" and tile.sold_by is None and not tile.paperwork and "Litigio" in features:
            compatible = any(tile.category in c.accepts for c in own.clients + market)
            if compatible and tile.priority != 1-pid:
                candidates.append((tile.base, tile))
    if candidates:
        max(candidates, key=lambda x: x[0])[1].paperwork = True
        return True
    return False


def make_sale(pid, players, board, revealed, market, deck, rng):
    options = sale_options(pid, players, board, revealed, market)
    if not options:
        return False
    _, raw, pos, source, client_idx = options[0]
    own, rival = players[pid], players[1-pid]
    tile = board[pos]
    # Una carta propia por venta; se guarda si la operacion ya es excelente.
    own_card = 0
    if own.agency and (raw < 10 or own.sales[tile.category] == 4 or rng.random() < 0.38):
        own.agency -= 1
        own_card = rng.choices([1, 2, 3, 4], [30, 38, 24, 8])[0]
    reaction = 0
    if rival.agency and (own.sales[tile.category] >= 3 or raw + own_card >= 13) and rng.random() < 0.28:
        rival.agency -= 1
        reaction = rng.choices([1, 2, 3], [25, 50, 25])[0]
    value = max(0, raw + own_card - reaction)
    own.score += value
    own.sale_values.append(value)
    own.sales[tile.category] += 1
    if source == "private":
        own.clients.pop(client_idx)
        own.clients.append(draw_client(deck, rng))
    else:
        market.pop(client_idx)
        market.append(draw_client(deck, rng))
    if tile.priority is not None:
        players[tile.priority].priorities_left += 1
    tile.priority = None
    tile.sold_by = pid
    return True


def take_turn(pid, players, board, revealed, market, deck, rng):
    used = set()
    for _ in range(2):
        own = players[pid]
        options = sale_options(pid, players, board, revealed, market)
        # Vender es prioritario si la operacion es razonable o cierra la partida.
        if "sell" not in used and options and (options[0][0] >= 6 or own.sales[board[options[0][2]].category] == 4):
            make_sale(pid, players, board, revealed, market, deck, rng)
            used.add("sell")
            continue
        if "reserve" not in used and reserve_best(pid, players, board, revealed, market):
            used.add("reserve")
            continue
        if "explore" not in used and reveal_one(pid, players, board, revealed, rng):
            used.add("explore")
            continue
        if "paperwork" not in used and process_paperwork(pid, players, board, revealed, market):
            used.add("paperwork")
            continue
        if "capture" not in used:
            best_idx = max(range(len(market)), key=lambda i: sum(category_weight(own.strategy, x, own, players[1-pid]) for x in market[i].accepts))
            own.clients.append(market.pop(best_idx))
            market.append(draw_client(deck, rng))
            if len(own.clients) > 4:
                # Descarta el cliente con menor cobertura de categorias deseadas.
                own.clients.sort(key=lambda c: sum(category_weight(own.strategy, x, own, players[1-pid]) for x in c.accepts), reverse=True)
                own.clients.pop()
            used.add("capture")
            continue
        if "agency" not in used:
            own.agency = min(5, own.agency + 1)
            used.add("agency")


def objective_points(player: Player) -> int:
    if player.objective == "Lujosa":
        return 8 if player.sales["Lujosa"] >= 4 else 0
    if player.objective == "Media":
        return 8 if player.sales["Media"] >= 4 else 0
    if player.objective == "Barata":
        return 8 if player.sales["Barata"] >= 4 else 0
    return 8 if all(player.sales[c] >= 2 for c in CATEGORIES) else 0


def finalize(players, trigger, responder_closed):
    for p in players:
        p.score += objective_points(p)
        if all(p.sales[c] >= 1 for c in CATEGORIES):
            p.score += 2
    if trigger is not None:
        players[trigger].score += 5
        if responder_closed:
            players[1-trigger].score += 2
    majority_bonus = {"Lujosa": 4, "Media": 3, "Barata": 2}
    for category, bonus in majority_bonus.items():
        if players[0].sales[category] > players[1].sales[category]:
            players[0].score += bonus
        elif players[1].sales[category] > players[0].sales[category]:
            players[1].score += bonus


def play_game(strategy0, strategy1, seed):
    rng = random.Random(seed)
    coords = coords_radius_three()
    tiles = build_tiles()
    rng.shuffle(tiles)
    board = dict(zip(coords, tiles))
    revealed = {p for p in coords if max(abs(p[0]), abs(p[1]), abs(-p[0]-p[1])) == 1}
    deck = build_clients()
    rng.shuffle(deck)
    players = [Player(strategy0), Player(strategy1)]
    for p in players:
        p.clients = [draw_client(deck, rng), draw_client(deck, rng)]
        p.objective = rng.choice((*CATEGORIES, "Equilibrio"))
    first = rng.randrange(2)
    trigger = None
    responder_closed = False
    rounds = 0
    market = [draw_client(deck, rng) for _ in range(3)]
    for round_no in range(1, 16):
        rounds = round_no
        order = (first, 1-first)
        for pid in order:
            take_turn(pid, players, board, revealed, market, deck, rng)
            if any(players[pid].sales[c] >= 5 for c in CATEGORIES):
                trigger = pid
                responder = 1-pid
                take_turn(responder, players, board, revealed, market, deck, rng)
                responder_closed = any(players[responder].sales[c] >= 5 for c in CATEGORIES)
                break
        if trigger is not None:
            break
        options = frontier(revealed, board)
        if options:
            # El crecimiento municipal no concede prioridad gratuita.
            revealed.add(rng.choice(options))
        first = 1-first
    finalize(players, trigger, responder_closed)
    if players[0].score != players[1].score:
        winner = 0 if players[0].score > players[1].score else 1
    else:
        total0, total1 = sum(players[0].sales.values()), sum(players[1].sales.values())
        winner = 0 if total0 > total1 else 1 if total1 > total0 else -1
    close_category = "Reloj"
    if trigger is not None:
        close_category = next(c for c in CATEGORIES if players[trigger].sales[c] >= 5)
    return {
        "strategy0": strategy0,
        "strategy1": strategy1,
        "winner": winner,
        "score0": players[0].score,
        "score1": players[1].score,
        "rounds": rounds,
        "trigger": trigger if trigger is not None else -1,
        "close_category": close_category,
        "sales0": sum(players[0].sales.values()),
        "sales1": sum(players[1].sales.values()),
        "lux0": players[0].sales["Lujosa"],
        "med0": players[0].sales["Media"],
        "cheap0": players[0].sales["Barata"],
        "lux1": players[1].sales["Lujosa"],
        "med1": players[1].sales["Media"],
        "cheap1": players[1].sales["Barata"],
    }


def summarize(rows):
    n = len(rows)
    wins = Counter(r["winner"] for r in rows)
    closes = Counter(r["close_category"] for r in rows)
    pair_stats = defaultdict(lambda: Counter(games=0, p0wins=0, p1wins=0, ties=0))
    strategy_stats = defaultdict(lambda: Counter(games=0, wins=0, ties=0))
    for r in rows:
        pair = (r["strategy0"], r["strategy1"])
        pair_stats[pair]["games"] += 1
        if r["winner"] == 0:
            pair_stats[pair]["p0wins"] += 1
        elif r["winner"] == 1:
            pair_stats[pair]["p1wins"] += 1
        else:
            pair_stats[pair]["ties"] += 1
        for pid in (0, 1):
            s = r[f"strategy{pid}"]
            strategy_stats[s]["games"] += 1
            if r["winner"] == pid:
                strategy_stats[s]["wins"] += 1
            elif r["winner"] == -1:
                strategy_stats[s]["ties"] += 1
    return {
        "games": n,
        "seat0_win_rate": wins[0] / n,
        "seat1_win_rate": wins[1] / n,
        "tie_rate": wins[-1] / n,
        "average_rounds": sum(r["rounds"] for r in rows) / n,
        "average_total_sales": sum(r["sales0"] + r["sales1"] for r in rows) / n,
        "average_margin": sum(abs(r["score0"] - r["score1"]) for r in rows) / n,
        "average_score": sum(r["score0"] + r["score1"] for r in rows) / (2*n),
        "close_rates": {k: v/n for k, v in closes.items()},
        "strategy_stats": {
            s: {"games": c["games"], "win_rate": c["wins"]/c["games"], "tie_rate": c["ties"]/c["games"]}
            for s, c in strategy_stats.items()
        },
        "pair_stats": {
            f"{a}_vs_{b}": {"games": c["games"], "p0_win_rate": c["p0wins"]/c["games"], "p1_win_rate": c["p1wins"]/c["games"], "tie_rate": c["ties"]/c["games"]}
            for (a, b), c in pair_stats.items()
        },
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--games-per-pair", type=int, default=1000)
    parser.add_argument("--seed", type=int, default=20260831)
    parser.add_argument("--output-dir", default="resultados-simulacion")
    args = parser.parse_args()
    rows = []
    game_id = 0
    for a in STRATEGIES:
        for b in STRATEGIES:
            for _ in range(args.games_per_pair):
                rows.append(play_game(a, b, args.seed + game_id * 7919))
                game_id += 1
    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)
    with (out / "partidas.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    summary = summarize(rows)
    (out / "resumen.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
