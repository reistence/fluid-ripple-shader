import * as T from 'three';
// eslint-disable-next-line import/no-unresolved
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import fragment from '../shaders/fragment.glsl';
import vertex from '../shaders/vertex.glsl';
import brush from '../assets/brush.png';

import bg from '../assets/og2.jpg';
const device = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: window.devicePixelRatio
};

export default class Three {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouse = new T.Vector2();
    this.prevMouse = new T.Vector2();
    this.currentWave = 0;

    this.scene = new T.Scene();
    this.scene1 = new T.Scene();

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera = new T.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    var frustunSize = this.height;

    var aspect = this.width / this.height;

    this.camera = new T.OrthographicCamera(
      (frustunSize * aspect) / -2,
      (frustunSize * aspect) / 2,
      frustunSize / 2,
      frustunSize / -2,
      -1000,
      1000
    );
    this.camera.position.set(0, 0, 2);
    this.scene.add(this.camera);

    this.baseTexture = new T.WebGLRenderTarget(this.width, this.height, {
      minFilter: T.LinearFilter,
      magFilter: T.LinearFilter,
      format: T.RGBAFormat
    });

    this.renderer = new T.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(device.width, device.height);
    this.renderer.setPixelRatio(Math.min(device.pixelRatio, 2));
    // this.controls = new OrbitControls(this.camera, this.canvas);

    this.clock = new T.Clock();

    this.setLights();
    this.setGeometry();
    this.render();
    this.setResize();
    this.mouseEvents();
  }

  setLights() {
    this.ambientLight = new T.AmbientLight(new T.Color(1, 1, 1, 1));
    this.scene.add(this.ambientLight);
  }

  mouseEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX - this.width / 2;
      this.mouse.y = this.height / 2 - e.clientY;
    });

    window.addEventListener('click', (e) => {
      this.mouse.x = e.clientX - this.width / 2;
      this.mouse.y = this.height / 2 - e.clientY;

      // Trigger the wave creation on click
      this.setNewWave(this.mouse.x, this.mouse.y, this.currentWave);
      this.currentWave = (this.currentWave + 1) % this.max;
    });
  }

  setGeometry() {
    this.planeGeometry = new T.PlaneGeometry(64, 64, 1, 1);
    this.planeGeometryFullScreen = new T.PlaneGeometry(
      this.width,
      this.height,
      1,
      1
    );
    this.planeMaterial = new T.ShaderMaterial({
      side: T.DoubleSide,
      // wireframe: true,
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms: {
        time: { value: 0 },
        progress: { type: 'f', value: 0 },
        uDisplacement: { value: null },
        uTexture: { value: new T.TextureLoader().load(bg) },
        resolution: { value: new T.Vector4() }
      }
    });

    // this.planeMaterial1 = new T.MeshBasicMaterial({
    //   transparent: true,
    //   map: new T.TextureLoader().load(brush)
    // });

    this.max = 100;
    this.meshes = [];

    for (let i = 0; i < this.max; i++) {
      let m = new T.MeshBasicMaterial({
        transparent: true,
        map: new T.TextureLoader().load(brush),
        blending: T.AdditiveBlending,
        depthTest: false,
        depthWrite: false
      });

      let mesh = new T.Mesh(this.planeGeometry, m);
      mesh.visible = false;
      mesh.rotation.z = 2 * Math.PI * Math.random();

      this.scene.add(mesh);
      this.meshes.push(mesh);
    }

    this.planeMesh = new T.Mesh(
      this.planeGeometryFullScreen,
      this.planeMaterial
    );
    this.scene1.add(this.planeMesh);
  }

  setNewWave(x, y, index) {
    let m = this.meshes[index];
    m.visible = true;
    m.position.x = x;
    m.position.y = y;
    m.material.opacity = 1;
    m.scale.x = m.scale.y = 0.2;
  }

  trackMousePos() {
    if (
      Math.abs(this.mouse.x - this.prevMouse.x) < 4 &&
      Math.abs(this.mouse.y - this.prevMouse.y) < 4
    ) {
    } else {
      this.setNewWave(this.mouse.x, this.mouse.y, this.currentWave);
      this.currentWave = (this.currentWave + 1) % this.max;
      // console.log(this.currentWave);
    }

    this.prevMouse.x = this.mouse.x;
    this.prevMouse.y = this.mouse.y;
  }

  render() {
    this.trackMousePos();
    const elapsedTime = this.clock.getElapsedTime();

    this.time += 0.05;
    this.planeMaterial.uniforms.time.value = this.time;

    requestAnimationFrame(this.render.bind(this));

    this.renderer.setRenderTarget(this.baseTexture);
    this.renderer.render(this.scene, this.camera);

    this.planeMaterial.uniforms.uDisplacement.value = this.baseTexture.texture;
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.scene1, this.camera);

    this.meshes.forEach((mesh) => {
      // mesh.position.x = this.mouse.x;
      // mesh.position.y = this.mouse.y;

      if (mesh.visible) {
        mesh.rotation.z += 0.008;
        mesh.material.opacity *= 0.95;
        mesh.scale.x = 0.982 * mesh.scale.x + 0.108;
        mesh.scale.y = mesh.scale.x;

        if (mesh.material.opacity < 0.002) {
          mesh.visible = false;
        }
      }
    });
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

