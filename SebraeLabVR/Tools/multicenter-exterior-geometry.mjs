// Primitives for metre-based, material-batched Unity meshes.
export const mix = (a, b, t) => a + (b - a) * t;
export const clamp = (t) => Math.max(0, Math.min(1, t));
export function smooth(a, b, x) {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}
export const dot = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0);
export const add = (a, b) => a.map((v, i) => v + b[i]);
export const sub = (a, b) => a.map((v, i) => v - b[i]);
export const mul = (a, t) => a.map((v) => v * t);
export const cross = ([x, y, z], [a, b, c]) => [y * c - z * b, z * a - x * c, x * b - y * a];
export const unit = (v) => mul(v, 1 / (Math.hypot(...v) || 1));
export const up = [0, 1, 0];
export const front = [0, 0, -1];

export function triangle(target, positions, normal, uv) {
  const area = cross(sub(positions[1], positions[0]), sub(positions[2], positions[0]));
  if (dot(area, area) < 1e-15) return;
  const direction = normal || unit(area);
  const normals = Array.isArray(direction[0]) ? direction : positions.map(() => direction);
  const order = dot(area, normals[0]) < 0 ? [0, 2, 1] : [0, 1, 2];
  for (const i of order) {
    const [x, y, z] = positions[i];
    target.push([x, y, z, ...normals[i], ...(uv?.[i] || [x, z])]);
  }
}

export function quad(target, p, normal, uv) {
  for (const ids of [[0, 1, 2], [0, 2, 3]]) {
    triangle(target, ids.map((i) => p[i]), Array.isArray(normal?.[0]) ? ids.map((i) => normal[i]) : normal, uv && ids.map((i) => uv[i]));
  }
}

export function box(target, min, max) {
  const [x, y, z] = min;
  const [a, b, c] = max;
  quad(target, [[x,y,z],[a,y,z],[a,b,z],[x,b,z]], front);
  quad(target, [[x,y,c],[a,y,c],[a,b,c],[x,b,c]], [0,0,1]);
  quad(target, [[x,y,z],[x,y,c],[x,b,c],[x,b,z]], [-1,0,0]);
  quad(target, [[a,y,z],[a,y,c],[a,b,c],[a,b,z]], [1,0,0]);
  quad(target, [[x,b,z],[a,b,z],[a,b,c],[x,b,c]], up);
  quad(target, [[x,y,z],[a,y,z],[a,y,c],[x,y,c]], [0,-1,0]);
}

export function grid(target, point, columns, rows, normal) {
  let row = Array.from({ length: columns + 1 }, (_, i) => point(i / columns, 0));
  for (let j = 1; j <= rows; j++) {
    const next = row.map((_, i) => point(i / columns, j / rows));
    for (let i = 0; i < columns; i++) {
      const p = [row[i], row[i + 1], next[i + 1], next[i]];
      quad(target, p, typeof normal === 'function' ? p.map(normal) : normal);
    }
    row = next;
  }
}

export function tube(target, a, b, radius, end = radius, sides = 10, cap = true) {
  const axis = unit(sub(b, a));
  const u = unit(cross(axis, Math.abs(axis[1]) > 0.9 ? [1, 0, 0] : up));
  const v = cross(axis, u);
  for (let i = 0; i < sides; i++) {
    const radial = (step) => add(mul(u, Math.cos(step * Math.PI * 2 / sides)), mul(v, Math.sin(step * Math.PI * 2 / sides)));
    const n = radial(i), m = radial(i + 1);
    const p = add(a, mul(n, radius)), q = add(a, mul(m, radius));
    const r = add(b, mul(n, end)), s = add(b, mul(m, end));
    quad(target, [p, q, s, r], [n, m, m, n]);
    if (cap) {
      triangle(target, [a, p, q], mul(axis, -1));
      triangle(target, [b, r, s], axis);
    }
  }
}

export function beam(target, a, b, width, depth = width) {
  const axis = unit(sub(b, a));
  const u = mul(unit(cross(axis, Math.abs(axis[1]) > 0.9 ? [1, 0, 0] : up)), width / 2);
  const v = mul(unit(cross(axis, u)), depth / 2);
  const corners = [add(u, v), sub(v, u), mul(add(u, v), -1), sub(u, v)];
  for (let i = 0; i < 4; i++) {
    const c = corners[i], d = corners[(i + 1) % 4];
    quad(target, [add(a,c), add(b,c), add(b,d), add(a,d)], unit(add(c,d)));
  }
  quad(target, corners.map((p) => add(a,p)), mul(axis,-1));
  quad(target, corners.map((p) => add(b,p)), axis);
}

export function truss(target, a, b, depth, count, width) {
  const at = (i, h) => add(add(a, mul(sub(b,a), i / count)), [0,h,0]);
  beam(target, a, b, width);
  beam(target, at(0,-depth), at(count,-depth), width);
  for (let i = 0; i < count; i++) {
    beam(target, at(i,0), at(i,-depth), width * 0.58);
    const flip = i % 2;
    beam(target, at(i + flip,0), at(i + 1 - flip,-depth), width * 0.49);
  }
  beam(target, at(count,0), at(count,-depth), width * 0.58);
}

// Uniform Catmull–Rom along planar control points, used for curbs and painted lines.
export function spline(points, samples, closed = false) {
  const count = closed ? points.length : points.length - 1;
  const index = (i) => closed ? (i + points.length) % points.length : Math.max(0, Math.min(i, count));
  const result = [];
  for (let i = 0; i < count; i++) {
    const [a,b,c,d] = [-1,0,1,2].map((j) => points[index(i+j)]);
    for (let j = 0; j < samples; j++) {
      const t = j / samples;
      result.push(b.map((v,k) => 0.5 * (2*v + (c[k]-a[k])*t + (2*a[k]-5*v+4*c[k]-d[k])*t*t + (3*v-a[k]-3*c[k]+d[k])*t*t*t)));
    }
  }
  result.push(closed ? result[0] : points.at(-1));
  return result;
}

export function offsetPath(path, offset) {
  return path.map(([x,z],i) => {
    const [dx,dz] = unit(sub(path[Math.min(i+1,path.length-1)], path[Math.max(0,i-1)]));
    return [x-dz*offset,z+dx*offset];
  });
}

export function ribbon(target, path, width, height, offset = 0) {
  const left = offsetPath(path, offset - width / 2).map(([x,z]) => [x,height(x,z),z]);
  const right = offsetPath(path, offset + width / 2).map(([x,z]) => [x,height(x,z),z]);
  for (let i = 1; i < path.length; i++) quad(target, [left[i-1],right[i-1],right[i],left[i]], up);
}

export function random(seed) {
  return () => {
    seed = (Math.imul(1664525,seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
