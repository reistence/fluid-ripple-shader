import * as T from 'three';
// eslint-disable-next-line import/no-unresolved
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import fragment from '../shaders/fragment.glsl';
import vertex from '../shaders/vertex.glsl';

// IMG

import black from '../assets/balckcap.jpg';
import red from '../assets/blend.jpg';
import shiny from '../assets/sniny.png';
import redBg from '../assets/redBg.png';
import starsBg from '../assets/startbg.png';
import irridescentBg from '../assets/irridescent.png';
import blackBg from '../assets/blackBg.jpg';
const device = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: window.devicePixelRatio
};

export default class Three {
  constructor(canvas) {
    this.canvas = canvas;
    this.scenes = [
      {
        bg: blackBg,
        matcap: black,
        geometry: new T.BoxGeometry(0.1, 0.1, 0.1)
      },
      {
        bg: irridescentBg,
        matcap: shiny,
        geometry: new T.BoxGeometry(0.1, 0.1, 0.1)
      },
      {
        bg: redBg,
        matcap: redBg,
        geometry: new T.BoxGeometry(0.1, 0.1, 0.1)
      }
    ];

    // this.scene = this.createScene(bg, matcap);

    this.scenes.forEach((o, index) => {
      o.scene = this.createScene(o.bg, o.matcap, o.geometry);
    });

    this.camera = new T.PerspectiveCamera(
      75,
      device.width / device.height,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 2);
    // this.scene.add(this.camera);

    this.renderer = new T.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(device.width, device.height);
    this.renderer.setPixelRatio(Math.min(device.pixelRatio, 2));

    this.controls = new OrbitControls(this.camera, this.canvas);

    this.clock = new T.Clock();

    this.setLights();
    this.setGeometry();
    this.render();
    this.setResize();
  }

  setLights() {
    this.ambientLight = new T.AmbientLight(new T.Color(1, 1, 1, 0.1));
    // this.scene.add(this.ambientLight);
  }

  setGeometry() {
    this.planeGeometry = new T.PlaneGeometry(1, 1, 128, 128);
    this.planeMaterial = new T.ShaderMaterial({
      side: T.DoubleSide,
      wireframe: true,
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms: {
        progress: { type: 'f', value: 0 }
      }
    });

    this.planeMesh = new T.Mesh(this.planeGeometry, this.planeMaterial);
    // this.scene.add(this.planeMesh);
  }

  createScene(bg, matcap, geometry) {
    let scene = new T.Scene();
    let bgTexture = new T.TextureLoader().load(bg);
    scene.background = bgTexture;
    let material = new T.MeshMatcapMaterial({
      matcap: new T.TextureLoader().load(matcap)
    });

    // let geometry = new T.BoxGeometry(0.2, 0.2, 0.2);
    let mesh = new T.Mesh(geometry, material);

    for (let i = 0; i < 300; i++) {
      let random = new T.Vector3().randomDirection();
      let clone = mesh.clone();
      clone.position.copy(random);
      clone.rotation.x = Math.random();
      clone.rotation.y = Math.random();
      scene.add(clone);
    }

    return scene;
  }

  render() {
    const elapsedTime = this.clock.getElapsedTime();

    this.renderer.render(this.scenes[0].scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }

  setResize() {
    window.addEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
    device.width = window.innerWidth;
    device.height = window.innerHeight;

    this.camera.aspect = device.width / device.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(device.width, device.height);
    this.renderer.setPixelRatio(Math.min(device.pixelRatio, 2));
  }
}

