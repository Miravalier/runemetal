export class Packet {
    constructor(resources, visited_runes) {
        if (typeof visited_runes === "undefined") {
            visited_runes = new Set();
        }
        this.resources = resources;
        this.visited_runes = visited_runes;
    }

    visit(rune, direction) {
        const visit_key = `${rune.x},${rune.y},${direction}`;
        if (this.visited_runes.has(visit_key)) {
            return;
        }
        this.visited_runes.add(visit_key);
        rune.onReceive(this, direction);
    }

    copy() {
        const packet = new Packet({}, this.visited_runes);
        Object.assign(packet.resources, this.resources);
    }
}
