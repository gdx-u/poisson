function create_canvas() {
    let canvas = document.createElement("canvas");
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
    document.body.appendChild(canvas);
    return canvas.getContext("2d");
}

const scale = window.devicePixelRatio || 1;
const ctx = create_canvas();
ctx.scale(scale, scale);
ctx.fillStyle = "black";

function line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

function add_point(x, y, c) {
    c = c || "black";
    ctx.beginPath();
    ctx.strokeStyle = c;
    ctx.arc(x, y, ts / 2, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

const pick_random = arr => arr[Math.floor(Math.random() * arr.length)];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function cell(p) {
    return [
        Math.floor((p[0] + 1) / l),
        Math.floor((p[1] + 1) / l)
    ];
}

function too_close(q, e) {
    let q_cell = cell(q);
    let close = [];
    let v = e ? 2 : 2;
    for (let x = -v; x <= v; x++) {
        for (let y = -v; y <= v; y++) {
            let check_cell = [q_cell[0] + x, q_cell[1] + y];
            if (grid[check_cell] && Math.hypot(
                (grid[check_cell][0] - q[0]),
                (grid[check_cell][1] - q[1])
            ) < (e ? e_mod * r : r)) {
                if (!e) return true;
                close.push(grid[check_cell]);
            }
        }
    }

    if (e) return close;
    return false;
}

let points = [];
let active_points = [];
let grid = {};
let ts = 1;

const k = 15;
let r = 4;
const dw = window.innerWidth;
const dh = window.innerHeight;

const e_mod = 1.4;

let l = r / Math.SQRT2;

async function main(p) {
    active_points = [];
    points = [];
    grid = {};
    await sleep(1);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = "black";
    l = r / Math.SQRT2;

    points.push(p);
    active_points.push(p);
    grid[cell(p)] = p;

    let count = 0;
    let top = 1;
    while (active_points.length > 0) {
        let active = pick_random(active_points);
        for (let i = 0; i < k; i++) {
            let theta = random(0, 2 * Math.PI);
            let radius = random(r, 2 * r);

            let q = [active[0] + radius * Math.cos(theta), active[1] + radius * Math.sin(theta)];

            if (
                q[0] > 0 && q[0] < dw
            &&  q[1] > 0 && q[1] < dh
            &&  !too_close(q)
            ) {
                points.push(q);
                active_points.push(q);
                grid[cell(q)] = q;
                add_point(...q, "red");
            }
        }

        if (++count == top) {
            count = 0;
            top++;
            await new Promise(requestAnimationFrame);
        }

        add_point(...active);
        active_points = active_points.filter(e => e !== active);
    }
}

let px;
let py;


document.onmousedown = async function (e) {
    main([e.pageX, e.pageY]);
    px = e.pageX;
    py = e.pageY;
}

document.onkeydown = e => {
    switch (e.key) {
        case "ArrowLeft":
            r -= 0.4;
            if (typeof(px) !== "undefined") main([px, py]);
            break;
        case "ArrowRight":
            r += 0.4;
            if (typeof(px) !== "undefined") main([px, py]);
            break;
        case "ArrowUp":
            ts++;
            if (typeof(px) !== "undefined") main([px, py]);
            break;
        case "ArrowDown":
            ts--;
            if (typeof(px) !== "undefined") main([px, py]);
            break;
        case " ":
            connect(3);
            break;
    }
}



async function connect(n) {
    //ctx.fillStyle = "white";
    //ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    //ctx.fillStyle = "black";
    n = n | 3;
    let count = 0;
    let top = 1;
    for (let point of points) {
        let closest = too_close(point, true);
        if (closest) {
            let to_right = closest.filter(p => p[0] > point[0]);

            let min_dist = r;
            let max_dist = e_mod * r;

            for (let p2 of to_right) {
                let ds = 240 * (Math.hypot(p2[0] - point[0], p2[1] - point[1]) - min_dist) / (max_dist - min_dist);
                add_point(...point, "white");
                add_point(...p2, "white");
                line(point[0], point[1], p2[0], p2[1]);
            }
            if (++count == top) {
                await new Promise(requestAnimationFrame);
                count = 0;
                top++;
            }
        }

    }
}

// main();
