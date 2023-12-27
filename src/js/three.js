import * as T from 'three';
// eslint-disable-next-line import/no-unresolved
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import fragment from '../shaders/fragment.glsl';
import vertex from '../shaders/vertex.glsl';
import brush from '../assets/brush.png';

const device = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: window.devicePixelRatio
};

export default class Three {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouse = new T.Vector2();

    this.scene = new T.Scene();
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
  }

  setGeometry() {
    this.planeGeometry = new T.PlaneGeometry(100, 100, 1, 1);
    // this.planeMaterial = new T.ShaderMaterial({
    //   side: T.DoubleSide,
    //   wireframe: true,
    //   fragmentShader: fragment,
    //   vertexShader: vertex,
    //   uniforms: {
    //     progress: { type: 'f', value: 0 }
    //   }
    // });

    // this.planeMaterial1 = new T.MeshBasicMaterial({
    //   transparent: true,
    //   map: new T.TextureLoader().load(brush)
    // });

    this.max = 1;
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
      // mesh.visible = false;
      mesh.rotation.z = 2 * Math.PI * Math.random();

      this.scene.add(mesh);
      this.meshes.push(mesh);
    }

    // this.planeMesh = new T.Mesh(this.planeGeometry, this.planeMaterial1);
    // this.scene.add(this.planeMesh);
  }

  render() {
    const elapsedTime = this.clock.getElapsedTime();

    // this.planeMesh.rotation.x = 0.2 * elapsedTime;
    // this.planeMesh.rotation.y = 0.1 * elapsedTime;

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
    this.meshes.forEach((mesh) => {
      mesh.position.x = this.mouse.x;
      mesh.position.y = this.mouse.y;
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

