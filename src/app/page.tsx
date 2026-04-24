'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './home.css';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const webglRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ── 2. FLOATING PARTICLES ──
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
      particlesContainer.innerHTML = ''; // clean up on re-run
      for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 3 + 2; 
        p.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 12 + 10}s;
            animation-delay: ${Math.random() * 12}s;
            opacity: 0;
        `;
        particlesContainer.appendChild(p);
      }
    }

    // ── 3. THREE.JS SCENE ──
    if (!webglRef.current) return;
    webglRef.current.innerHTML = ''; // clean up

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    webglRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // ── 4. LOAD MODEL ──
    const loader = new GLTFLoader();
    let model: THREE.Group | null = null;
    let animationFrameId: number;

    loader.load('/models/mesh4.glb', (gltf) => {
      model = gltf.scene;
      scene.add(model);

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3 / maxDim;

      model.scale.setScalar(scale);
      model.position.sub(center.multiplyScalar(scale));

      initScrollAnimations();
    });

    // ── 5. GSAP SCROLL ANIMATIONS ──
    function initScrollAnimations() {
      // Create a context so we can easily revert all ScrollTriggers on unmount
      let ctx = gsap.context(() => {
        gsap.utils.toArray('.home-content').forEach((el: any) => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 78%',
            }
          });
        });

        gsap.utils.toArray('.hero-content h1').forEach((el: any) => {
          const words = el.innerHTML.split('<br>').join('</span><br><span>');
          el.innerHTML = `<span class="line">${words}</span>`;
          const spans = el.querySelectorAll('span');
          spans.forEach((span: any, i: number) => {
            gsap.from(span, {
              y: 60,
              opacity: 0,
              duration: 1.1,
              delay: i * 0.15,
              ease: 'back.out(1.4)',
              scrollTrigger: { trigger: el, start: 'top 85%' }
            });
          });
        });

        gsap.utils.toArray('.hero-sub').forEach((el: any) => {
          gsap.from(el, {
            y: 30,
            opacity: 0,
            duration: 0.9,
            delay: 0.3,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
          });
        });

        gsap.utils.toArray('.hero-actions').forEach((el: any) => {
          gsap.from(el.querySelectorAll('.home-btn'), {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'back.out(1.4)',
            scrollTrigger: { trigger: el, start: 'top 85%' }
          });
        });

        gsap.utils.toArray('.hero-stats').forEach((el: any) => {
          gsap.from(el.querySelectorAll('.stat'), {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
          });
        });

        gsap.utils.toArray('.home-card').forEach((card: any, i: number) => {
          gsap.from(card, {
            opacity: 0,
            y: 40,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 85%' }
          });
        });

        gsap.utils.toArray('.step').forEach((step: any, i: number) => {
          gsap.from(step, {
            opacity: 0,
            x: -40,
            duration: 0.7,
            delay: i * 0.15,
            ease: 'power3.out',
            scrollTrigger: { trigger: step, start: 'top 85%' }
          });
        });

        gsap.utils.toArray('.tcard').forEach((tcard: any, i: number) => {
          gsap.from(tcard, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            delay: i * 0.12,
            ease: 'power3.out',
            scrollTrigger: { trigger: tcard, start: 'top 88%' }
          });
        });

        if (model) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.8
            }
          });

          tl.to(model.rotation, { y: Math.PI, x: 0.2, duration: 2 })
            .to(model.position, { x: -2.8, z: 2, duration: 2 }, '-=1')
            .to(model.rotation, { y: Math.PI * 1.5, duration: 2 }, '<')
            .to(model.position, { x: 2.5, z: 0.5, duration: 2 })
            .to(model.rotation, { z: Math.PI / 6, y: Math.PI * 2.2, duration: 2 }, '<')
            .to(model.position, { x: 0, z: 1, duration: 2 })
            .to(model.rotation, { y: Math.PI * 3, x: 0, z: 0, duration: 2 }, '<')
            .to(model.scale, { x: model.scale.x * 1.15, y: model.scale.y * 1.15, z: model.scale.z * 1.15, duration: 2 }, '<');
        }
      }, containerRef);
    }

    // ── 6. RENDER LOOP ──
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // ── 7. RESIZE ──
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      ScrollTrigger.getAll().forEach(t => t.kill());
      if (webglRef.current) {
        webglRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="home-wrapper" ref={containerRef}>
      {/* Floating particles */}
      <div className="particles" id="particles"></div>

      {/* 3D Background Canvas */}
      <div id="webgl-container" ref={webglRef}></div>

      {/* ── SCROLLABLE MAIN ── */}
      <main style={{ marginTop: '-52px' }}> {/* Counteract the padding from layout.tsx */}
        {/* SECTION 1 — HERO */}
        <section className="home-section hero">
          <div className="home-content hero-content">
            <h1>Cook Smarter.<br /><span className="gradient-text">Not Harder.</span></h1>
            <p className="hero-sub">Generate precise recipes with exact quantities and step-by-step guidance — powered by advanced AI trained on thousands of culinary masterpieces.</p>
            <div className="hero-actions">
              <Link href="/generator" className="home-btn btn-primary">Generate a Recipe</Link>
              <Link href="/explore" className="home-btn btn-ghost">Watch Demo ▶</Link>
            </div>
            <div className="hero-stats">
              <div className="stat"><span className="stat-num">12K+</span><span className="stat-label">Recipes</span></div>
              <div className="stat-divider"></div>
              <div className="stat"><span className="stat-num">98%</span><span className="stat-label">Accuracy</span></div>
              <div className="stat-divider"></div>
              <div className="stat"><span className="stat-num">3s</span><span className="stat-label">Generation</span></div>
            </div>
          </div>
        </section>

        {/* SECTION 2 — WHAT WE DO */}
        <section className="home-section section-features">
          <div className="home-content features-content">
            <div className="home-badge">✦ Features</div>
            <h2>Everything you need<br /><span className="gradient-text">to master the kitchen.</span></h2>
            <div className="cards-grid">
              <div className="home-card card-glow">
                <div className="card-icon">🤖</div>
                <h3>AI Recipe Engine</h3>
                <p>Tell us what you have — we'll craft the perfect recipe. Powered by cutting-edge language models.</p>
              </div>
              <div className="home-card">
                <div className="card-icon">⚗️</div>
                <h3>Exact Quantities</h3>
                <p>No more guesswork. Get precise measurements in grams, ml, and cups for flawless results every time.</p>
              </div>
              <div className="home-card">
                <div className="card-icon">🗺️</div>
                <h3>Step-by-Step Guide</h3>
                <p>Crystal-clear instructions broken into simple steps — from mise en place to plating.</p>
              </div>
              <div className="home-card card-glow">
                <div className="card-icon">🌍</div>
                <h3>Explore Cuisines</h3>
                <p>Discover thousands of verified recipes across Italian, Asian, Mediterranean and beyond.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — HOW IT WORKS */}
        <section className="home-section section-how">
          <div className="home-content how-content">
            <div className="home-badge">✦ How It Works</div>
            <h2>Three steps to your<br /><span className="gradient-text">next masterpiece.</span></h2>
            <div className="steps">
              <div className="step">
                <span className="step-num">01</span>
                <div className="step-body">
                  <h3>Describe Your Dish</h3>
                  <p>Type any dish name, cuisine, or list the ingredients you have on hand.</p>
                </div>
              </div>
              <div className="step-line"></div>
              <div className="step">
                <span className="step-num">02</span>
                <div className="step-body">
                  <h3>AI Crafts It</h3>
                  <p>Our model generates a detailed recipe with exact quantities in under 3 seconds.</p>
                </div>
              </div>
              <div className="step-line"></div>
              <div className="step">
                <span className="step-num">03</span>
                <div className="step-body">
                  <h3>Cook & Save</h3>
                  <p>Follow the guide, save your favorites, and build a personal recipe collection.</p>
                </div>
              </div>
            </div>
            <Link href="/generator" className="home-btn btn-primary" style={{ marginTop: '3rem' }}>Try It Free →</Link>
          </div>
        </section>

        {/* SECTION 4 — SHOWCASE MARQUEE */}
        <section className="home-section section-marquee">
          <div className="marquee-wrapper">
            <div className="marquee-track">
              <span>Pasta Carbonara</span><span className="dot">✦</span>
              <span>Miso Ramen</span><span className="dot">✦</span>
              <span>Beef Wellington</span><span className="dot">✦</span>
              <span>Avocado Toast</span><span className="dot">✦</span>
              <span>Tiramisu</span><span className="dot">✦</span>
              <span>Butter Chicken</span><span className="dot">✦</span>
              <span>Pad Thai</span><span className="dot">✦</span>
              <span>Croissants</span><span className="dot">✦</span>
              <span>Sushi Rolls</span><span className="dot">✦</span>
              <span>Pasta Carbonara</span><span className="dot">✦</span>
              <span>Miso Ramen</span><span className="dot">✦</span>
              <span>Beef Wellington</span><span className="dot">✦</span>
              <span>Avocado Toast</span><span className="dot">✦</span>
              <span>Tiramisu</span><span className="dot">✦</span>
              <span>Butter Chicken</span><span className="dot">✦</span>
              <span>Pad Thai</span><span className="dot">✦</span>
              <span>Croissants</span><span className="dot">✦</span>
              <span>Sushi Rolls</span><span className="dot">✦</span>
            </div>
          </div>
          <div className="home-content marquee-content">
            <h2>Loved by food enthusiasts<br /><span className="gradient-text">around the world.</span></h2>
            <div className="testimonials">
              <div className="tcard">
                <p>"Cooking Lab changed how I plan meals — it's like having a personal chef in my pocket."</p>
                <div className="tcard-author">— Sarah M., Home Cook</div>
              </div>
              <div className="tcard tcard-accent">
                <p>"The exact quantities feature is a game-changer. No more failed recipes from vague instructions."</p>
                <div className="tcard-author">— Chef Marco R.</div>
              </div>
              <div className="tcard">
                <p>"I generated 50 unique recipes in a week. The AI understands flavor profiles incredibly well."</p>
                <div className="tcard-author">— Priya K., Food Blogger</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5 — CTA */}
        <section className="home-section section-cta">
          <div className="home-content cta-content">
            <div className="cta-glow"></div>
            <div className="home-badge">✦ Start For Free</div>
            <h2>Your next favorite meal<br /><span className="gradient-text">is one prompt away.</span></h2>
            <p>Join thousands of home cooks and professional chefs already using Cooking Lab to create unforgettable dishes.</p>
            <div className="hero-actions">
              <Link href="/generator" className="home-btn btn-primary btn-large">Create Your First Recipe</Link>
              <Link href="/explore" className="home-btn btn-ghost">Explore Recipes</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
