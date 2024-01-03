import * as T from 'three';
// eslint-disable-next-line import/no-unresolved
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import fragment from '../shaders/fragment.glsl';
import vertex from '../shaders/vertex.glsl';

import { Lethargy } from 'lethargy';
import { WheelGesture } from '@use-gesture/vanilla';

import GUI from 'lil-gui';
import VirtualScroll from 'virtual-scroll';

// IMG
import black from '../assets/balckcap.jpg';
import red from '../assets/blend.jpg';
import shiny from '../assets/sniny.png';
import redBg from '../assets/redBg.png';
import irridescentBg from '../assets/irridescent.png';
import blackBg from '../assets/blackBg.jpg';
const device = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: window.devicePixelRatio
};

export default class Three {
  constructor(canvas) {
    this.scroller = new VirtualScroll();

    this.current = 0;
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

    this.time = 0;

    // this.scene = this.createScene(bg, matcap);

    // this.lethargy = new Lethargy();

    // this.gesture = new WheelGesture(document.body, (state) => {});

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

    this.scenes.forEach((o, index) => {
      o.scene = this.createScene(o.bg, o.matcap, o.geometry);

      this.renderer.compile(o.scene, this.camera);

      o.target = new T.WebGLRenderTarget(device.width, device.height);
    });

    // this.controls = new OrbitControls(this.camera, this.canvas);

    this.clock = new T.Clock();

    this.currentState = 0;

    this.setLights();
    this.setUpSettings();
    this.setGeometry();
    this.initPost();
    this.setResize();
    this.render();
    this.scroller.on((event) => {
      this.currentState -= event.deltaY / 4000;

      this.currentState = (this.currentState + 3000) % 3;
    });
  }

  setLights() {
    this.ambientLight = new T.AmbientLight(new T.Color(1, 1, 1, 0.1));
    // this.scene.add(this.ambientLight);
  }

  setUpSettings() {
    this.settings = {
      progress: 0
    };
    this.gui = new GUI();
    this.gui.add(this.settings, 'progress', 0, 1, 0.01).onChange((val) => {});
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

  initPost() {
    this.postScene = new T.Scene();
    let frustunSize = 1;
    let aspect = 1;
    this.postCamera = new T.OrthographicCamera(
      (frustunSize * aspect) / -2,
      (frustunSize * aspect) / 2,
      frustunSize / 2,
      frustunSize / -2,
      -1000,
      1000
    );

    this.material = new T.ShaderMaterial({
      side: T.DoubleSide,
      uniforms: {
        progress: { value: 0 },
        uTexture1: { value: new T.TextureLoader().load(blackBg) },
        uTexture2: { value: new T.TextureLoader().load(blackBg) }
      },
      vertexShader: vertex,
      fragmentShader: fragment
    });

    let quad = new T.Mesh(new T.PlaneGeometry(1, 1), this.material);

    this.postScene.add(quad);
  }

  render() {
    const elapsedTime = this.clock.getElapsedTime();

    this.time += 0.05;

    this.current = Math.floor(this.currentState);

    this.next = Math.floor((this.currentState + 1) % this.scenes.length);

    this.settings.progress = this.currentState % 1;

    this.renderer.setRenderTarget(this.scenes[this.current].target);
    this.renderer.render(this.scenes[this.current].scene, this.camera);

    this.next = (this.current + 1) % this.scenes.length;

    this.renderer.setRenderTarget(this.scenes[this.current + 1].target);
    this.renderer.render(this.scenes[this.current + 1].scene, this.camera);

    this.renderer.setRenderTarget(null);

    this.material.uniforms.uTexture1.value =
      this.scenes[this.current].target.texture;

    this.material.uniforms.uTexture2.value =
      this.scenes[this.next].target.texture;

    this.material.uniforms.progress.value = this.settings.progress;

    // update scenes
    this.scenes.forEach((o) => {
      o.scene.rotation.y = this.time * 0.1;
    });

    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.postScene, this.postCamera);
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

