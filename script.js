import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'dat.gui'

const loader = new THREE.TextureLoader();
const colorMap = loader.load("AlanAss.png");
const depthMap = loader.load("AlanAssDepthMap.png");
console.log(colorMap);

const geometry = new THREE.PlaneGeometry(2.048, 1.280, 400, 400);

const scene = new THREE.Scene();
const material = new THREE.ShaderMaterial({
  color: null,
  uniforms: {
    uTexture: { value: colorMap },
    uDepth: { value: depthMap },
    uHeight: { value: 0.2 }, // Strength of height pop
  },
  vertexShader: `
    varying vec2 vUv;

    uniform sampler2D uDepth;
    uniform float uHeight;

    void main() {
      vUv = uv;
      
      float depth = texture2D(uDepth, uv).r;

      // Push toward camera in view space
      vec3 displacedPosition = position + normal * depth * uHeight;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D uTexture;

    void main() {
      gl_FragColor = texture2D(uTexture, vUv);
    }
  `,
  side: THREE.DoubleSide
});


const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 1.5;

// initialize the renderer
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth/2, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 200;
controls.minDistance = 1;

const gui = new GUI();

const config = {
  parallax: 0.05,
  depthNear: 0.2,
  depthFar: 0.9
};

gui.add(material.uniforms.uHeight, "value", 0.0, 0.5, 0.01)
   .name("Height");
const renderloop = () => {
  
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderloop);
};


renderloop();
