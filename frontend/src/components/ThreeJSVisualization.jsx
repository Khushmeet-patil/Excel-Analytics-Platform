import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry';

export default function ThreeJSVisualization({ data, columns, selectedColumns, chartType, chartTitle, columnColors }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous scene if it exists
    if (rendererRef.current) {
      try {
        // Check if the element is actually a child before removing
        if (containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      } catch (error) {
        console.error('Error cleaning up previous renderer:', error);
      }
    }

    // If no columns are selected, don't create a new scene
    if (selectedColumns.length === 0) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controlsRef.current = controls;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create visualization based on chart type
    createVisualization();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        try {
          // Check if the container and element still exist
          if (containerRef.current && rendererRef.current.domElement &&
              containerRef.current.contains(rendererRef.current.domElement)) {
            containerRef.current.removeChild(rendererRef.current.domElement);
          }
          rendererRef.current.dispose();
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      }
    };
  }, [data, columns, selectedColumns, chartType, columnColors]);

  // Create visualization based on chart type
  const createVisualization = () => {
    if (!sceneRef.current || selectedColumns.length === 0) return;

    // Clear previous objects
    while (sceneRef.current.children.length > 0) {
      const object = sceneRef.current.children[0];
      if (object.type === 'Mesh') {
        object.geometry.dispose();
        object.material.dispose();
      }
      sceneRef.current.remove(object);
    }

    // Filter numeric columns
    const numericColumns = columns.filter(col =>
      col.type === 'number' && selectedColumns.includes(col.id)
    );

    if (numericColumns.length === 0) {
      console.error('Please select at least one numeric column for visualization');
      return;
    }

    // Get data for visualization
    const visualizationData = data.map(row =>
      numericColumns.map(col => row[col.id])
    );

    // Create visualization based on chart type
    switch (chartType) {
      case '3d-scatter':
        create3DScatterPlot(visualizationData, numericColumns);
        break;
      case '3d-line':
        create3DLinePlot(visualizationData, numericColumns);
        break;
      case '3d-surface':
        create3DSurfacePlot(visualizationData, numericColumns);
        break;
      case '3d-mesh':
        create3DMeshPlot(visualizationData, numericColumns);
        break;
      default:
        create3DScatterPlot(visualizationData, numericColumns);
    }
  };

  // Create 3D scatter plot
  const create3DScatterPlot = (data, columns) => {
    // Create a simple fallback if we don't have enough data or columns
    if (data.length === 0 || columns.length < 3) {
      console.error('3D scatter plot requires at least 3 numeric columns');

      // Create some random points as fallback
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];

      // Generate 100 random points
      for (let i = 0; i < 100; i++) {
        positions.push(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        );

        colors.push(Math.random(), Math.random(), Math.random());
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true
      });

      const points = new THREE.Points(geometry, material);
      sceneRef.current.add(points);

      // Add axes
      addAxes();
      return;
    }

    try {
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];

      // Normalize data for better visualization
      const minMax = columns.slice(0, 3).map(col => {
        const values = data.map(row => row[columns.indexOf(col)]);
        const min = Math.min(...values.filter(v => !isNaN(v)));
        const max = Math.max(...values.filter(v => !isNaN(v)));
        return {
          min: isFinite(min) ? min : 0,
          max: isFinite(max) ? max : 1
        };
      });

      // Create points
      data.forEach(row => {
        try {
          // Normalize x, y, z to range [-2, 2]
          const x = ((row[0] - minMax[0].min) / (minMax[0].max - minMax[0].min || 1) * 4) - 2;
          const y = ((row[1] - minMax[1].min) / (minMax[1].max - minMax[1].min || 1) * 4) - 2;
          const z = ((row[2] - minMax[2].min) / (minMax[2].max - minMax[2].min || 1) * 4) - 2;

          // Only add valid points
          if (isFinite(x) && isFinite(y) && isFinite(z)) {
            positions.push(x, y, z);

            // Use custom color if available, otherwise use random color
            if (columnColors && columnColors[columns[0].id]) {
              // Convert hex color to RGB
              const color = new THREE.Color(columnColors[columns[0].id]);
              colors.push(color.r, color.g, color.b);
            } else {
              // Add random color for each point
              colors.push(Math.random(), Math.random(), Math.random());
            }
          }
        } catch (error) {
          console.error('Error processing data point:', error);
        }
      });

      // If we have no valid points, create some random ones
      if (positions.length === 0) {
        for (let i = 0; i < 100; i++) {
          positions.push(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4
          );

          colors.push(Math.random(), Math.random(), Math.random());
        }
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true
      });

      const points = new THREE.Points(geometry, material);
      sceneRef.current.add(points);
    } catch (error) {
      console.error('Error creating 3D scatter plot:', error);
    }

    // Add axes
    addAxes();
  };

  // Create 3D line plot
  const create3DLinePlot = (data, columns) => {
    // Create a simple fallback if we don't have enough data or columns
    if (data.length === 0 || columns.length < 3) {
      console.error('3D line plot requires at least 3 numeric columns');

      // Create a simple line as fallback
      const geometry = new THREE.BufferGeometry();
      const positions = [];

      // Generate a spiral line
      for (let i = 0; i < 100; i++) {
        const t = i / 100 * Math.PI * 2 * 3;
        positions.push(
          Math.cos(t) * 2,
          i / 100 * 4 - 2,
          Math.sin(t) * 2
        );
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

      const material = new THREE.LineBasicMaterial({
        color: 0x0000ff
      });

      const line = new THREE.Line(geometry, material);
      sceneRef.current.add(line);

      // Add axes
      addAxes();
      return;
    }

    try {
      const geometry = new THREE.BufferGeometry();
      const positions = [];

      // Normalize data for better visualization
      const minMax = columns.slice(0, 3).map(col => {
        const values = data.map(row => row[columns.indexOf(col)]);
        const min = Math.min(...values.filter(v => !isNaN(v)));
        const max = Math.max(...values.filter(v => !isNaN(v)));
        return {
          min: isFinite(min) ? min : 0,
          max: isFinite(max) ? max : 1
        };
      });

      // Create line
      data.forEach(row => {
        try {
          // Normalize x, y, z to range [-2, 2]
          const x = ((row[0] - minMax[0].min) / (minMax[0].max - minMax[0].min || 1) * 4) - 2;
          const y = ((row[1] - minMax[1].min) / (minMax[1].max - minMax[1].min || 1) * 4) - 2;
          const z = ((row[2] - minMax[2].min) / (minMax[2].max - minMax[2].min || 1) * 4) - 2;

          // Only add valid points
          if (isFinite(x) && isFinite(y) && isFinite(z)) {
            positions.push(x, y, z);
          }
        } catch (error) {
          console.error('Error processing data point:', error);
        }
      });

      // If we have no valid points, create a spiral line
      if (positions.length === 0) {
        for (let i = 0; i < 100; i++) {
          const t = i / 100 * Math.PI * 2 * 3;
          positions.push(
            Math.cos(t) * 2,
            i / 100 * 4 - 2,
            Math.sin(t) * 2
          );
        }
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

      // Use custom color if available, otherwise use default blue
      const lineColor = columnColors && columns.length > 0 && columnColors[columns[0].id]
        ? new THREE.Color(columnColors[columns[0].id])
        : 0x0000ff;

      const material = new THREE.LineBasicMaterial({
        color: lineColor
      });

      const line = new THREE.Line(geometry, material);
      sceneRef.current.add(line);
    } catch (error) {
      console.error('Error creating 3D line plot:', error);
    }

    // Add axes
    addAxes();
  };

  // Create 3D surface plot
  const create3DSurfacePlot = (data, columns) => {
    // Check if we have enough data
    if (data.length === 0 || columns.length === 0) {
      console.error('3D surface plot requires data');
      // Create a simple plane as fallback
      const geometry = new THREE.PlaneGeometry(4, 4, 20, 20);
      const material = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide,
        wireframe: true
      });

      const surface = new THREE.Mesh(geometry, material);
      sceneRef.current.add(surface);

      // Add axes
      addAxes();
      return;
    }

    // For simplicity, we'll create a parametric surface
    const parametricFunction = (u, v, target) => {
      const x = (u - 0.5) * 4;
      const z = (v - 0.5) * 4;

      try {
        // Use data to create a height map
        const row = Math.floor(u * data.length);
        const col = Math.floor(v * columns.length);
        const y = data[Math.min(row, data.length - 1)][Math.min(col, columns.length - 1)] / 10;

        target.set(x, y, z);
      } catch (error) {
        // Fallback if data access fails
        target.set(x, 0, z);
      }
    };

    // Use the imported ParametricGeometry instead of ParametricBufferGeometry
    const geometry = new ParametricGeometry(parametricFunction, 20, 20);

    // Use custom color if available, otherwise use default green
    const surfaceColor = columnColors && columns.length > 0 && columnColors[columns[0].id]
      ? new THREE.Color(columnColors[columns[0].id])
      : 0x00ff00;

    const material = new THREE.MeshPhongMaterial({
      color: surfaceColor,
      side: THREE.DoubleSide,
      flatShading: true
    });

    const surface = new THREE.Mesh(geometry, material);
    sceneRef.current.add(surface);

    // Add axes
    addAxes();
  };

  // Create 3D mesh plot
  const create3DMeshPlot = (data, columns) => {
    // Create a simple cube mesh for demonstration
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    // Use custom color if available, otherwise use default red
    const meshColor = columnColors && columns.length > 0 && columnColors[columns[0].id]
      ? new THREE.Color(columnColors[columns[0].id])
      : 0xff0000;

    const material = new THREE.MeshPhongMaterial({
      color: meshColor,
      wireframe: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    sceneRef.current.add(mesh);

    // Add axes
    addAxes();
  };

  // Add axes to the scene
  const addAxes = () => {
    const axesHelper = new THREE.AxesHelper(3);
    sceneRef.current.add(axesHelper);
  };

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
}
