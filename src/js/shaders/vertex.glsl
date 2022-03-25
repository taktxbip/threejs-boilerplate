uniform float time;
varying vec2 vUv;
 
void main() {
    vUv = uv;

    vec3 newPosition = position;

    newPosition.z += 100.5 * sin(newPosition.x * 10.0 + time * 0.03);
    newPosition.z += 400.0 * cnoise(vec3(newPosition.x, newPosition.y, time * 0.02));

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( newPosition, 1.0 );
} 