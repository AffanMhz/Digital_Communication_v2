// Gram-Schmidt Orthonormalization Interactive Visualization
// By Affan MhZ

class GramSchmidt {
    constructor() {
        this.canvas = document.getElementById('signalCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.stepsOutput = document.getElementById('stepsOutput');
        this.setupEventListeners();
        this.setupPskWaveforms(); // Add PSK waveform setup
        this.compute(); // Initial computation
    }

    setupEventListeners() {
        document.getElementById('computeBtn').addEventListener('click', () => this.compute());
        
        // Enhanced event listeners for example buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const example = e.target.dataset.example;
                this.loadExample(example);
                
                // Add visual feedback
                document.querySelectorAll('.example-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Real-time update on input change
        ['s1x', 's1y', 's2x', 's2y', 's3x', 's3y'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                // Clear active example when manually editing
                document.querySelectorAll('.example-btn').forEach(b => b.classList.remove('active'));
                
                // Debounce the computation
                clearTimeout(this.updateTimeout);
                this.updateTimeout = setTimeout(() => this.compute(), 500);
            });
        });
    }

    setupPskWaveforms() {
        // BPSK Waveform Setup
        this.drawBpskWaveform();
        document.getElementById('updateBpsk').addEventListener('click', () => this.drawBpskWaveform());
        document.getElementById('bpskFreq').addEventListener('input', (e) => {
            document.getElementById('bpskFreqLabel').textContent = e.target.value + ' Hz';
        });

        // QPSK Waveform Setup
        this.drawQpskWaveform();
        document.getElementById('updateQpsk').addEventListener('click', () => this.drawQpskWaveform());
        document.getElementById('qpskFreq').addEventListener('input', (e) => {
            document.getElementById('qpskFreqLabel').textContent = e.target.value + ' Hz';
        });

        // 8-PSK Waveform Setup
        this.drawPsk8Waveform();
        document.getElementById('updatePsk8').addEventListener('click', () => this.drawPsk8Waveform());
        document.getElementById('psk8Freq').addEventListener('input', (e) => {
            document.getElementById('psk8FreqLabel').textContent = e.target.value + ' Hz';
        });

        // Draw constellation diagrams
        this.drawConstellationDiagrams();
    }

    loadExample(exampleNum) {
        const examples = this.getExampleDefinitions();
        const example = examples[exampleNum];
        
        if (example) {
            this.setValues(...example.vectors);
            this.showExampleInfo(example);
            this.compute();
        }
    }

    getExampleDefinitions() {
        return {
            '1': { // Real BPSK Implementation
                name: 'BPSK (Binary Phase Shift Keying)',
                description: 'Real BPSK signals using antipodal signaling for optimal error performance in AWGN channels.',
                vectors: [1, 0, -1, 0, 0, 0], // φ1 = √(2/T)cos(2πfct), φ2 = -√(2/T)cos(2πfct)
                theory: 'BPSK uses two antipodal signals s₁(t) = √(2E/T)cos(2πfct) and s₂(t) = -√(2E/T)cos(2πfct). These signals are separated by maximum Euclidean distance (2√E), providing optimal BER performance.',
                applications: [
                    'Deep Space Communications (NASA missions)',
                    'Satellite Communication (INMARSAT)',
                    'Digital Radio Broadcasting (DAB)',
                    'Wireless Sensor Networks'
                ],
                properties: {
                    'Signal Energy': 'E = A²T/2',
                    'Minimum Distance': 'd_min = 2√E',
                    'BER (AWGN)': 'Pe = Q(√(2E/N₀))',
                    'Bandwidth': 'B = 2/T (null-to-null)',
                    'Spectral Efficiency': '1 bit/s/Hz (theoretical)'
                },
                technicalSpecs: {
                    'Carrier Frequency': '2.4 GHz (typical)',
                    'Symbol Duration': '1 μs',
                    'Required SNR': '9.6 dB (BER = 10⁻⁶)'
                }
            },
            
            '2': { // Real QPSK Implementation  
                name: 'QPSK (Quadrature Phase Shift Keying)',
                description: 'Industry-standard QPSK using Gray coding and optimal constellation mapping for 2 bits per symbol transmission.',
                vectors: [0.707, 0.707, -0.707, 0.707, -0.707, -0.707], // I-Q components: (±1,±1)/√2
                theory: 'QPSK uses four constellation points at phases 45°, 135°, 225°, 315°. Signal: s(t) = √(2E/T)[I·cos(2πfct) - Q·sin(2πfct)] where I,Q ∈ {±1}.',
                applications: [
                    'LTE/4G Cellular (Control Channels)',
                    'DVB-S2 Satellite Television',
                    'IEEE 802.11b WiFi',
                    'GPS Navigation Signals',
                    'CDMA2000 Mobile Networks'
                ],
                properties: {
                    'Bits per Symbol': '2',
                    'Symbol Rate': 'Rs = Rb/2',
                    'Average Energy': 'Es = 2E',
                    'BER (Gray Coded)': 'Pe ≈ Q(√(Es/N₀))',
                    'Bandwidth Efficiency': '2 bits/s/Hz',
                    'Peak-to-Average Ratio': '0 dB (constant envelope)'
                },
                technicalSpecs: {
                    'IEEE 802.11': '11 Mbps at 22 MHz',
                    'DVB-S2': 'Up to 90 Mbps',
                    'Required SNR': '6.8 dB (BER = 10⁻⁶)'
                }
            },

            '3': { // Real 16-QAM Implementation
                name: '16-QAM (Quadrature Amplitude Modulation)',
                description: 'High-efficiency 16-QAM constellation used in modern broadband systems for 4 bits per symbol.',
                vectors: [3, 1, 1, 3, -1, 1], // Representing different amplitude levels
                theory: '16-QAM uses both phase and amplitude modulation with 16 constellation points in a 4×4 grid. Average energy varies with bit patterns, requiring careful power control.',
                applications: [
                    'LTE-Advanced (64QAM/256QAM)',
                    'Cable Modems (DOCSIS 3.1)',
                    'Digital Terrestrial TV (DVB-T2)',
                    'Microwave Point-to-Point Links',
                    'IEEE 802.11n/ac WiFi'
                ],
                properties: {
                    'Bits per Symbol': '4',
                    'Constellation Size': '16 points',
                    'Average Energy': 'Depends on Gray mapping',
                    'BER (Approximation)': 'Pe ≈ (3/2)Q(√(4Es/5N₀))',
                    'Bandwidth Efficiency': '4 bits/s/Hz',
                    'PAPR': '~3 dB higher than QPSK'
                },
                technicalSpecs: {
                    'LTE Category 4': 'Up to 150 Mbps',
                    'Cable Modem': 'Up to 1 Gbps',
                    'Required SNR': '16.5 dB (BER = 10⁻⁶)'
                }
            },

            '4': { // Real OFDM Subcarriers
                name: 'OFDM Orthogonal Subcarriers',
                description: 'Orthogonal Frequency Division Multiplexing using mathematically orthogonal sinusoidal subcarriers.',
                vectors: [1, 0, 0.707, 0.707, 0, 1], // Different subcarrier frequencies
                theory: 'OFDM uses N orthogonal subcarriers: sk(t) = exp(j2πk∆ft) where ∆f = 1/T ensures orthogonality over symbol duration T.',
                applications: [
                    'LTE/5G NR Cellular Networks',
                    'IEEE 802.11a/g/n/ac/ax WiFi',
                    'Digital Audio Broadcasting (DAB)',
                    'DVB-T Digital Television',
                    'WiMAX Broadband'
                ],
                properties: {
                    'Subcarrier Spacing': '∆f = 1/T',
                    'Orthogonality': '∫₀ᵀ sk(t)sl*(t)dt = T·δkl',
                    'Cyclic Prefix': 'Guards against ISI',
                    'FFT Implementation': 'O(N log N) complexity',
                    'Spectral Efficiency': 'High with adaptive loading'
                },
                technicalSpecs: {
                    'LTE': '15 kHz subcarrier spacing',
                    'WiFi 6': 'Up to 9.6 Gbps',
                    '5G NR': '15/30/60/120 kHz spacing'
                }
            },

            '5': { // Real Walsh-Hadamard Codes
                name: 'Walsh-Hadamard Codes (CDMA)',
                description: 'Orthogonal Walsh codes used in IS-95 CDMA and GPS systems for spreading spectrum multiple access.',
                vectors: [1, 1, 1, -1, -1, 1], // W₄ Hadamard matrix rows
                theory: 'Walsh codes are generated from Hadamard matrices. For length N=2ⁿ, they provide perfect orthogonality: ∑WᵢWⱼ = N·δᵢⱼ.',
                applications: [
                    'IS-95/cdmaOne Cellular',
                    'GPS C/A and P(Y) Codes',
                    'IEEE 802.11 DSSS',
                    'Bluetooth Frequency Hopping',
                    'WCDMA/UMTS Channelization'
                ],
                properties: {
                    'Code Length': 'N = 2ⁿ (powers of 2)',
                    'Cross-correlation': 'Perfect zero for ideal channel',
                    'Processing Gain': 'Gp = N (in dB: 10log₁₀N)',
                    'Auto-correlation': 'Perfect delta function',
                    'Generation': 'Recursive Hadamard construction'
                },
                technicalSpecs: {
                    'IS-95': '64-chip Walsh codes',
                    'GPS': '1023-chip Gold codes',
                    'Processing Gain': '18 dB (64-chip)'
                }
            },

            '6': { // Real Pulse Shaping
                name: 'Nyquist Pulse Shaping (RRC)',
                description: 'Root-Raised Cosine (RRC) pulse shaping for ISI-free transmission and matched filtering.',
                vectors: [0.8, 0.6, 0.4, 0.2, 0, 0], // RRC impulse response samples
                theory: 'RRC filters satisfy Nyquist criterion: ∑h(t-nT) = constant. Transmit and receive RRC filters combine to form raised cosine response.',
                applications: [
                    'GSM/EDGE Mobile Networks',
                    'LTE Physical Layer',
                    'Digital Satellite Communications',
                    'Software Defined Radio',
                    'High-Speed Data Modems'
                ],
                properties: {
                    'Roll-off Factor': 'α ∈ [0, 1]',
                    'ISI': 'Zero at sampling instants',
                    'Bandwidth': 'B = (1+α)/(2T)',
                    'Matched Filter': 'Optimizes SNR',
                    'Implementation': 'FIR filter structure'
                },
                technicalSpecs: {
                    'GSM': 'α = 0.3, Gaussian BT = 0.3',
                    'LTE': 'α = 0.22 for data channels',
                    'Satellite': 'α = 0.2-0.4 typical'
                }
            },

            '7': { // Real MIMO Precoding
                name: 'MIMO Spatial Streams',
                description: 'Multiple-Input Multiple-Output spatial diversity using orthogonal precoding matrices.',
                vectors: [1, 0.5, 0.5, 1, -0.5, 0.5], // Alamouti code example
                theory: 'MIMO uses spatial orthogonality: H†H = I for optimal detection. Alamouti code provides diversity gain: [s₁ s₂; -s₂* s₁*].',
                applications: [
                    'LTE-Advanced MIMO',
                    'IEEE 802.11n/ac/ax',
                    '5G Massive MIMO',
                    'WiMAX 2×2 MIMO',
                    'Satellite Communication Arrays'
                ],
                properties: {
                    'Diversity Gain': 'Min(Nt, Nr)',
                    'Spatial Multiplexing': 'Up to min(Nt,Nr) streams',
                    'Channel Capacity': 'C = log₂(det(I + γH†H))',
                    'Precoding': 'SVD, Water-filling',
                    'Array Gain': '10log₁₀(N) dB'
                },
                technicalSpecs: {
                    'WiFi 6E': 'Up to 8×8 MIMO',
                    '5G NR': 'Up to 32×32 massive MIMO',
                    'Throughput Gain': '2-4x with 2×2 MIMO'
                }
            },

            '8': { // Real Spread Spectrum
                name: 'Direct Sequence Spread Spectrum',
                description: 'DSSS using PN sequences for anti-jamming and multiple access in military and civilian systems.',
                vectors: [1, -1, 1, 1, -1, -1], // m-sequence example
                theory: 'DSSS multiplies data by high-rate PN sequence: s(t) = d(t)·c(t)·cos(2πfct). Provides processing gain Gp = Tc/Td.',
                applications: [
                    'Military Communications (Anti-jam)',
                    'GPS Satellite Navigation',
                    'IEEE 802.11 DSSS/CCK',
                    'Bluetooth Low Energy',
                    'Amateur Radio Spread Spectrum'
                ],
                properties: {
                    'Processing Gain': 'Gp = Rc/Rd (chip/data rate)',
                    'Jamming Margin': 'Mj = Gp - Losses',
                    'Correlation': 'Peak = N, Sidelobe ≤ √N',
                    'Bandwidth': 'W = Rc (chip rate)',
                    'Covertness': 'Low probability of intercept'
                },
                technicalSpecs: {
                    'GPS C/A': '1.023 MHz chip rate',
                    '802.11 DSSS': '11 MHz bandwidth',
                    'Processing Gain': '10-30 dB typical'
                }
            }
        };
    }

    showExampleInfo(example) {
        // Create info panel if it doesn't exist
        let infoPanel = document.getElementById('example-info-panel');
        if (!infoPanel) {
            infoPanel = document.createElement('div');
            infoPanel.id = 'example-info-panel';
            infoPanel.className = 'example-info-panel';
            
            const examplesSection = document.querySelector('.examples-section');
            examplesSection.appendChild(infoPanel);
        }

        // Update info panel content
        infoPanel.innerHTML = `
            <h3>${example.name}</h3>
            <p class="description">${example.description}</p>
            
            <div class="theory-section">
                <h4>📚 Theory</h4>
                <p>${example.theory}</p>
            </div>
            
            <div class="applications-section">
                <h4>🔧 Applications</h4>
                <ul>
                    ${example.applications.map(app => `<li>${app}</li>`).join('')}
                </ul>
            </div>
            
            <div class="properties-section">
                <h4>⚡ Key Properties</h4>
                <div class="properties-grid">
                    ${Object.entries(example.properties).map(([key, value]) => 
                        `<div class="property-item">
                            <strong>${key}:</strong> ${value}
                        </div>`
                    ).join('')}
                </div>
            </div>
        `;

        // Animate panel appearance
        infoPanel.style.opacity = '0';
        infoPanel.style.transform = 'translateY(20px)';
        setTimeout(() => {
            infoPanel.style.transition = 'all 0.3s ease-out';
            infoPanel.style.opacity = '1';
            infoPanel.style.transform = 'translateY(0)';
        }, 50);
    }

    setValues(s1x, s1y, s2x, s2y, s3x, s3y) {
        document.getElementById('s1x').value = s1x;
        document.getElementById('s1y').value = s1y;
        document.getElementById('s2x').value = s2x;
        document.getElementById('s2y').value = s2y;
        document.getElementById('s3x').value = s3x;
        document.getElementById('s3y').value = s3y;
    }

    getInputVectors() {
        return [
            [parseFloat(document.getElementById('s1x').value), 
             parseFloat(document.getElementById('s1y').value)],
            [parseFloat(document.getElementById('s2x').value), 
             parseFloat(document.getElementById('s2y').value)],
            [parseFloat(document.getElementById('s3x').value), 
             parseFloat(document.getElementById('s3y').value)]
        ];
    }

    dotProduct(v1, v2) {
        return v1[0] * v2[0] + v1[1] * v2[1];
    }

    norm(v) {
        return Math.sqrt(this.dotProduct(v, v));
    }

    normalize(v) {
        const n = this.norm(v);
        if (n === 0) return [0, 0];
        return [v[0] / n, v[1] / n];
    }

    scalarMultiply(scalar, v) {
        return [scalar * v[0], scalar * v[1]];
    }

    subtract(v1, v2) {
        return [v1[0] - v2[0], v1[1] - v2[1]];
    }

    add(v1, v2) {
        return [v1[0] + v2[0], v1[1] + v2[1]];
    }

    formatVector(v) {
        return `[${v[0].toFixed(3)}, ${v[1].toFixed(3)}]`;
    }

    gramSchmidtProcess(signals) {
        const steps = [];
        const basis = [];

        // Filter out zero vectors
        const nonZeroSignals = signals.filter(s => this.norm(s) > 0.001);

        if (nonZeroSignals.length === 0) {
            steps.push({
                title: 'Error',
                content: 'All input signals are zero vectors. Please provide non-zero signals.'
            });
            return { basis, steps };
        }

        // Step 1: First basis vector
        const s1 = nonZeroSignals[0];
        const norm_s1 = this.norm(s1);
        const phi1 = this.normalize(s1);
        
        steps.push({
            title: 'Step 1: First Basis Function φ₁',
            content: `
                Input signal: s₁ = ${this.formatVector(s1)}<br>
                Norm: ||s₁|| = √(${s1[0].toFixed(3)}² + ${s1[1].toFixed(3)}²) = ${norm_s1.toFixed(4)}<br>
                <strong>Normalized: φ₁ = s₁/||s₁|| = ${this.formatVector(phi1)}</strong><br>
                Verification: ||φ₁|| = ${this.norm(phi1).toFixed(4)} ≈ 1
            `
        });
        basis.push(phi1);

        // Process remaining signals
        for (let i = 1; i < nonZeroSignals.length; i++) {
            const si = nonZeroSignals[i];
            let stepContent = `Input signal: s${i+1} = ${this.formatVector(si)}<br><br>`;
            
            // Project onto existing basis
            stepContent += '<strong>Projections:</strong><br>';
            let gi = [...si];
            
            for (let j = 0; j < basis.length; j++) {
                const cij = this.dotProduct(si, basis[j]);
                stepContent += `c${i+1}${j+1} = ⟨s${i+1}, φ${j+1}⟩ = ${cij.toFixed(4)}<br>`;
                
                const projection = this.scalarMultiply(cij, basis[j]);
                gi = this.subtract(gi, projection);
                stepContent += `Subtract ${cij.toFixed(4)} × φ${j+1}<br>`;
            }
            
            stepContent += `<br><strong>Gram vector:</strong> g${i+1} = ${this.formatVector(gi)}<br>`;
            
            const norm_gi = this.norm(gi);
            stepContent += `Norm: ||g${i+1}|| = ${norm_gi.toFixed(4)}<br>`;
            
            if (norm_gi < 0.001) {
                stepContent += `<br><span style="color: orange;">⚠ Signal s${i+1} is linearly dependent on previous signals (almost zero after projection). Skipping normalization.</span>`;
                steps.push({
                    title: `Step ${i+1}: Processing Signal s${i+1}`,
                    content: stepContent
                });
                continue;
            }
            
            const phii = this.normalize(gi);
            stepContent += `<br><strong>Normalized: φ${i+1} = g${i+1}/||g${i+1}|| = ${this.formatVector(phii)}</strong><br>`;
            stepContent += `Verification: ||φ${i+1}|| = ${this.norm(phii).toFixed(4)} ≈ 1`;
            
            // Check orthogonality
            stepContent += '<br><br><strong>Orthogonality check:</strong><br>';
            for (let j = 0; j < basis.length; j++) {
                const dot = this.dotProduct(phii, basis[j]);
                stepContent += `⟨φ${i+1}, φ${j+1}⟩ = ${dot.toFixed(6)} ≈ 0<br>`;
            }
            
            basis.push(phii);
            steps.push({
                title: `Step ${i+1}: Processing Signal s${i+1}`,
                content: stepContent
            });
        }

        // Summary
        let summary = '<strong>Final Orthonormal Basis:</strong><br>';
        basis.forEach((b, i) => {
            summary += `φ${i+1} = ${this.formatVector(b)}<br>`;
        });
        summary += '<br><strong>Properties:</strong><br>';
        summary += `• Number of basis functions: ${basis.length}<br>`;
        summary += '• All basis vectors are normalized (||φᵢ|| = 1)<br>';
        summary += '• All basis vectors are orthogonal (⟨φᵢ, φⱼ⟩ = 0 for i ≠ j)';
        
        steps.push({
            title: 'Summary',
            content: summary
        });

        return { basis, steps };
    }

    compute() {
        const signals = this.getInputVectors();
        const { basis, steps } = this.gramSchmidtProcess(signals);
        
        this.displaySteps(steps);
        this.drawVisualization(signals, basis);
    }

    displaySteps(steps) {
        this.stepsOutput.innerHTML = '';
        steps.forEach(step => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'step';
            stepDiv.innerHTML = `
                <div class="step-title">${step.title}</div>
                <div class="step-content">${step.content}</div>
            `;
            this.stepsOutput.appendChild(stepDiv);
        });
    }

    drawVisualization(signals, basis) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Check if dark mode is active
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        
        // Dynamic colors based on theme
        const backgroundColor = isDarkMode ? '#1e293b' : '#ffffff';
        const gridColor = isDarkMode ? '#475569' : '#e0e0e0';
        const axisColor = isDarkMode ? '#cbd5e1' : '#333';
        const textColor = isDarkMode ? '#e2e8f0' : '#333';
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // Setup coordinate system
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = 60; // pixels per unit
        
        // Draw grid
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        for (let i = -10; i <= 10; i++) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(centerX + i * scale, 0);
            ctx.lineTo(centerX + i * scale, height);
            ctx.stroke();
            
            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(0, centerY + i * scale);
            ctx.lineTo(width, centerY + i * scale);
            ctx.stroke();
        }
        
        // Draw axes
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 2;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();
        
        // Draw axis labels
        ctx.fillStyle = textColor;
        ctx.font = '16px Arial';
        ctx.fillText('φ₁', width - 30, centerY - 10);
        ctx.fillText('φ₂', centerX + 10, 20);
        
        // Draw origin
        ctx.fillStyle = axisColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Dynamic signal colors based on theme
        const signalColors = isDarkMode ? 
            ['#fca5a5', '#6ee7b7', '#93c5fd'] : // Lighter colors for dark mode
            ['#ff6b6b', '#4ecdc4', '#45b7d1'];   // Original colors for light mode
        
        const basisColors = isDarkMode ?
            ['#86efac', '#c4b5fd', '#fbbf24'] : // Lighter colors for dark mode
            ['#2ecc71', '#9b59b6', '#f39c12'];   // Original colors for light mode

        // Draw original signals
        signals.forEach((signal, i) => {
            if (this.norm(signal) > 0.001) {
                this.drawVector(
                    ctx, centerX, centerY, 
                    signal[0] * scale, -signal[1] * scale,
                    `s${i+1}`,
                    signalColors[i],
                    2,
                    true
                );
            }
        });
        
        // Draw orthonormal basis
        basis.forEach((b, i) => {
            this.drawVector(
                ctx, centerX, centerY,
                b[0] * scale * 2, -b[1] * scale * 2,
                `φ${i+1}`,
                basisColors[i],
                3,
                false
            );
        });
        
        // Draw legend
        this.drawLegend(ctx, signals.length, basis.length);
    }

    drawVector(ctx, startX, startY, dx, dy, label, color, lineWidth, isDashed) {
        const endX = startX + dx;
        const endY = startY + dy;
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = lineWidth;
        
        if (isDashed) {
            ctx.setLineDash([5, 5]);
        } else {
            ctx.setLineDash([]);
        }
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Draw arrowhead
        const angle = Math.atan2(dy, dx);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;
        
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowLength * Math.cos(angle - arrowAngle),
            endY - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowLength * Math.cos(angle + arrowAngle),
            endY - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // Draw label
        ctx.font = 'bold 16px Arial';
        ctx.fillText(label, endX + 10, endY - 10);
    }

    drawLegend(ctx, numSignals, numBasis) {
        const legendX = 20;
        const legendY = 20;
        const lineLength = 30;
        
        // Check dark mode for legend colors
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        
        ctx.font = '14px Arial';
        
        // Dynamic colors for legend
        const signalColors = isDarkMode ? 
            ['#fca5a5', '#6ee7b7', '#93c5fd'] : 
            ['#ff6b6b', '#4ecdc4', '#45b7d1'];
        
        for (let i = 0; i < numSignals; i++) {
            const y = legendY + i * 25;
            
            ctx.strokeStyle = signalColors[i];
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(legendX, y);
            ctx.lineTo(legendX + lineLength, y);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = signalColors[i];
            ctx.fillText(`s${i+1} (input)`, legendX + lineLength + 10, y + 5);
        }
        
        // Basis vectors
        const basisColors = isDarkMode ?
            ['#86efac', '#c4b5fd', '#fbbf24'] :
            ['#2ecc71', '#9b59b6', '#f39c12'];
        for (let i = 0; i < numBasis; i++) {
            const y = legendY + (numSignals + i) * 25;
            
            ctx.strokeStyle = basisColors[i];
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(legendX, y);
            ctx.lineTo(legendX + lineLength, y);
            ctx.stroke();
            
            ctx.fillStyle = basisColors[i];
            ctx.fillText(`φ${i+1} (basis)`, legendX + lineLength + 10, y + 5);
        }
    }

    drawBpskWaveform() {
        const canvas = document.getElementById('bpskCanvas');
        const ctx = canvas.getContext('2d');
        const bits = document.getElementById('bpskBits').value;
        const freq = parseFloat(document.getElementById('bpskFreq').value);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Fill background for better visibility in dark mode
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const bitDuration = canvas.width / bits.length;
        const amplitude = canvas.height * 0.15;
        const centerY = canvas.height / 2;

        // Draw grid
        this.drawGrid(ctx, canvas.width, canvas.height);
        
        // Draw digital bits (top)
        ctx.strokeStyle = isDarkMode ? '#94a3b8' : '#4a5568';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        
        for (let i = 0; i < bits.length; i++) {
            const bit = parseInt(bits[i]);
            const x1 = i * bitDuration;
            const x2 = (i + 1) * bitDuration;
            const y = centerY - amplitude * 2 - (bit * amplitude * 0.8);
            
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            
            // Vertical transitions
            if (i > 0 && parseInt(bits[i-1]) !== bit) {
                const prevY = centerY - amplitude * 2 - (parseInt(bits[i-1]) * amplitude * 0.8);
                ctx.moveTo(x1, prevY);
                ctx.lineTo(x1, y);
            }
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw BPSK modulated signal
        ctx.strokeStyle = isDarkMode ? '#f87171' : '#dc2626';
        ctx.lineWidth = 3;
        ctx.beginPath();

        const samplesPerBit = 200;
        for (let i = 0; i < bits.length; i++) {
            const bit = parseInt(bits[i]);
            const phase = bit === 1 ? 0 : Math.PI; // 0° for '1', 180° for '0'
            
            for (let j = 0; j < samplesPerBit; j++) {
                const t = (i * samplesPerBit + j) / samplesPerBit;
                const x = (t / bits.length) * canvas.width;
                const y = centerY + amplitude * Math.cos(2 * Math.PI * freq * t + phase);
                
                if (i === 0 && j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
        }
        ctx.stroke();

        // Add labels
        this.addWaveformLabels(ctx, canvas.width, canvas.height, 'BPSK Signal', bits);
    }

    drawQpskWaveform() {
        const canvas = document.getElementById('qpskCanvas');
        const ctx = canvas.getContext('2d');
        const bits = document.getElementById('qpskBits').value;
        const freq = parseFloat(document.getElementById('qpskFreq').value);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Fill background for better visibility in dark mode
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Ensure even number of bits for QPSK
        const paddedBits = bits.length % 2 === 0 ? bits : bits + '0';
        const symbols = paddedBits.length / 2;
        const symbolDuration = canvas.width / symbols;
        const amplitude = canvas.height * 0.15;
        const centerY = canvas.height / 2;

        // QPSK phase mapping (Gray coding)
        const phaseMap = { '00': Math.PI/4, '01': 3*Math.PI/4, '11': 5*Math.PI/4, '10': 7*Math.PI/4 };

        this.drawGrid(ctx, canvas.width, canvas.height);

        // Draw I and Q components
        ctx.strokeStyle = isDarkMode ? '#60a5fa' : '#2563eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // I component (cosine)
        for (let i = 0; i < symbols; i++) {
            const dibits = paddedBits.substr(i * 2, 2);
            const phase = phaseMap[dibits];
            const samplesPerSymbol = 200;
            
            for (let j = 0; j < samplesPerSymbol; j++) {
                const t = (i * samplesPerSymbol + j) / samplesPerSymbol;
                const x = (t / symbols) * canvas.width;
                const y = centerY - amplitude + amplitude * 0.6 * Math.cos(phase); // I component
                
                if (i === 0 && j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
        }
        ctx.stroke();

        // Q component (sine)
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < symbols; i++) {
            const dibits = paddedBits.substr(i * 2, 2);
            const phase = phaseMap[dibits];
            const samplesPerSymbol = 200;
            
            for (let j = 0; j < samplesPerSymbol; j++) {
                const t = (i * samplesPerSymbol + j) / samplesPerSymbol;
                const x = (t / symbols) * canvas.width;
                const y = centerY + amplitude + amplitude * 0.6 * Math.sin(phase); // Q component
                
                if (i === 0 && j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
        }
        ctx.stroke();

        // Draw combined QPSK signal
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let i = 0; i < symbols; i++) {
            const dibits = paddedBits.substr(i * 2, 2);
            const phase = phaseMap[dibits];
            const samplesPerSymbol = 200;
            
            for (let j = 0; j < samplesPerSymbol; j++) {
                const t = (i * samplesPerSymbol + j) / samplesPerSymbol;
                const x = (t / symbols) * canvas.width;
                const y = centerY + amplitude * Math.cos(2 * Math.PI * freq * t + phase);
                
                if (i === 0 && j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
        }
        ctx.stroke();

        this.addQpskLabels(ctx, canvas.width, canvas.height, paddedBits);
    }

    drawPsk8Waveform() {
        const canvas = document.getElementById('psk8Canvas');
        const ctx = canvas.getContext('2d');
        const bits = document.getElementById('psk8Bits').value;
        const freq = parseFloat(document.getElementById('psk8Freq').value);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Fill background for better visibility in dark mode
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        ctx.fillStyle = isDarkMode ? '#1e293b' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Ensure bits divisible by 3 for 8-PSK
        let paddedBits = bits;
        while (paddedBits.length % 3 !== 0) {
            paddedBits += '0';
        }
        
        const symbols = paddedBits.length / 3;
        const symbolDuration = canvas.width / symbols;
        const amplitude = canvas.height * 0.2;
        const centerY = canvas.height / 2;

        // 8-PSK Gray-coded phase mapping
        const phaseMap = {
            '000': 0, '001': Math.PI/4, '011': Math.PI/2, '010': 3*Math.PI/4,
            '110': Math.PI, '111': 5*Math.PI/4, '101': 3*Math.PI/2, '100': 7*Math.PI/4
        };

        this.drawGrid(ctx, canvas.width, canvas.height);

        // Draw 8-PSK modulated signal
        ctx.strokeStyle = isDarkMode ? '#a78bfa' : '#7c3aed';
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let i = 0; i < symbols; i++) {
            const tribits = paddedBits.substr(i * 3, 3);
            const phase = phaseMap[tribits];
            const samplesPerSymbol = 200;
            
            for (let j = 0; j < samplesPerSymbol; j++) {
                const t = (i * samplesPerSymbol + j) / samplesPerSymbol;
                const x = (t / symbols) * canvas.width;
                const y = centerY + amplitude * Math.cos(2 * Math.PI * freq * t + phase);
                
                if (i === 0 && j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
        }
        ctx.stroke();

        this.addPsk8Labels(ctx, canvas.width, canvas.height, paddedBits);
    }

    drawGrid(ctx, width, height) {
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        ctx.strokeStyle = isDarkMode ? '#475569' : '#e2e8f0';
        ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let y = 0; y <= height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Vertical lines
        for (let x = 0; x <= width; x += 100) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
    }

    addWaveformLabels(ctx, width, height, title, bits) {
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        ctx.fillStyle = isDarkMode ? '#f1f5f9' : '#2d3748';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(title, 10, 25);
        
        ctx.font = '12px Arial';
        ctx.fillText('Digital Data: ' + bits, 10, height - 40);
        ctx.fillText('Modulated Signal', 10, height - 20);
    }

    addQpskLabels(ctx, width, height, bits) {
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        ctx.fillStyle = isDarkMode ? '#f1f5f9' : '#2d3748';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('QPSK Signal Components', 10, 25);
        
        ctx.font = '12px Arial';
        ctx.fillStyle = isDarkMode ? '#60a5fa' : '#2563eb';
        ctx.fillText('I Component (Blue)', 10, height - 60);
        ctx.fillStyle = isDarkMode ? '#f87171' : '#dc2626';
        ctx.fillText('Q Component (Red)', 10, height - 40);
        ctx.fillStyle = isDarkMode ? '#34d399' : '#059669';
        ctx.fillText('Combined QPSK (Green)', 10, height - 20);
    }

    addPsk8Labels(ctx, width, height, bits) {
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        ctx.fillStyle = isDarkMode ? '#f1f5f9' : '#2d3748';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('8-PSK Modulated Signal', 10, 25);
        
        ctx.font = '12px Arial';
        ctx.fillText('Tribits: ' + bits.match(/.{1,3}/g).join(' '), 10, height - 20);
    }

    drawConstellationDiagrams() {
        this.drawBpskConstellation();
        this.drawQpskConstellationDiagram();
        this.drawPsk8ConstellationDiagram();
    }

    drawBpskConstellation() {
        const canvas = document.getElementById('bpskConstellation');
        const ctx = canvas.getContext('2d');
        const center = canvas.width / 2;
        const radius = 60;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        
        // Draw axes
        ctx.strokeStyle = isDarkMode ? '#64748b' : '#cbd5e0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, center); ctx.lineTo(canvas.width, center);
        ctx.moveTo(center, 0); ctx.lineTo(center, canvas.height);
        ctx.stroke();

        // BPSK points
        const points = [{x: center + radius, y: center, label: '1'}, {x: center - radius, y: center, label: '0'}];
        
        ctx.fillStyle = isDarkMode ? '#f87171' : '#dc2626';
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = isDarkMode ? '#e2e8f0' : '#2d3748';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(point.label, point.x - 4, point.y - 15);
            ctx.fillStyle = isDarkMode ? '#f87171' : '#dc2626';
        });
    }

    drawQpskConstellationDiagram() {
        const canvas = document.getElementById('qpskConstellation');
        const ctx = canvas.getContext('2d');
        const center = canvas.width / 2;
        const radius = 50;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        
        // Draw axes
        ctx.strokeStyle = isDarkMode ? '#64748b' : '#cbd5e0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, center); ctx.lineTo(canvas.width, center);
        ctx.moveTo(center, 0); ctx.lineTo(center, canvas.height);
        ctx.stroke();

        // QPSK points (Gray coded)
        const points = [
            {angle: Math.PI/4, label: '00'}, {angle: 3*Math.PI/4, label: '01'},
            {angle: 5*Math.PI/4, label: '11'}, {angle: 7*Math.PI/4, label: '10'}
        ];
        
        ctx.fillStyle = isDarkMode ? '#60a5fa' : '#2563eb';
        points.forEach(point => {
            const x = center + radius * Math.cos(point.angle);
            const y = center - radius * Math.sin(point.angle);
            
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = isDarkMode ? '#e2e8f0' : '#2d3748';
            ctx.font = '10px Arial';
            ctx.fillText(point.label, x - 8, y - 10);
            ctx.fillStyle = isDarkMode ? '#60a5fa' : '#2563eb';
        });
    }

    drawPsk8ConstellationDiagram() {
        const canvas = document.getElementById('psk8Constellation');
        const ctx = canvas.getContext('2d');
        const center = canvas.width / 2;
        const radius = 50;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        
        // Draw axes
        ctx.strokeStyle = isDarkMode ? '#64748b' : '#cbd5e0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, center); ctx.lineTo(canvas.width, center);
        ctx.moveTo(center, 0); ctx.lineTo(center, canvas.height);
        ctx.stroke();

        // 8-PSK points
        const labels = ['000', '001', '011', '010', '110', '111', '101', '100'];
        
        ctx.fillStyle = isDarkMode ? '#a78bfa' : '#7c3aed';
        for (let i = 0; i < 8; i++) {
            const angle = i * Math.PI / 4;
            const x = center + radius * Math.cos(angle);
            const y = center - radius * Math.sin(angle);
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = isDarkMode ? '#e2e8f0' : '#2d3748';
            ctx.font = '8px Arial';
            ctx.fillText(labels[i], x - 10, y - 8);
            ctx.fillStyle = isDarkMode ? '#a78bfa' : '#7c3aed';
        }
    }
}

// --- Dark Mode Implementation for Gram-Schmidt Page ---
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');
    if (!darkModeToggle && !darkModeToggleMobile) return;

    // Load saved dark mode preference or detect system preference
    let isDarkMode = localStorage.getItem('dark-mode');
    
    // If no saved preference, check system preference
    if (isDarkMode === null) {
        isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
        isDarkMode = isDarkMode === 'true';
    }
    
    if (isDarkMode) {
        // Apply dark mode to both <body> and <html> to avoid white flash on overscroll
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
        updateDarkModeButtons(true);
        // Update theme-color for browser UI
        const themeMeta = document.querySelector('meta[name="theme-color"]');
        if (themeMeta) themeMeta.setAttribute('content', '#0f172a');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (localStorage.getItem('dark-mode') === null) {
            if (e.matches) {
                document.body.classList.add('dark-mode');
                document.documentElement.classList.add('dark-mode');
                updateDarkModeButtons(true);
                const themeMeta = document.querySelector('meta[name="theme-color"]');
                if (themeMeta) themeMeta.setAttribute('content', '#0f172a');
            } else {
                document.body.classList.remove('dark-mode');
                document.documentElement.classList.remove('dark-mode');
                updateDarkModeButtons(false);
                const themeMeta = document.querySelector('meta[name="theme-color"]');
                if (themeMeta) themeMeta.setAttribute('content', '#dfdff3');
            }
        }
    });

    // Toggle dark mode function
    const toggleDarkMode = () => {
        const isCurrentlyDark = document.body.classList.contains('dark-mode');
        // Toggle on both body and html
        document.body.classList.toggle('dark-mode');
        document.documentElement.classList.toggle('dark-mode');
        const newDarkState = !isCurrentlyDark;
        
        // Save preference
        localStorage.setItem('dark-mode', newDarkState);
        
        // Update button appearance
        updateDarkModeButtons(newDarkState);
        
        // Update theme-color
        const themeMeta = document.querySelector('meta[name="theme-color"]');
        if (themeMeta) themeMeta.setAttribute('content', newDarkState ? '#0f172a' : '#dfdff3');

        // Announce to screen reader
        announceToScreenReader(newDarkState ? 'Dark mode enabled' : 'Dark mode disabled');
    };

    // Add event listeners to both buttons
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    if (darkModeToggleMobile) {
        darkModeToggleMobile.addEventListener('click', toggleDarkMode);
    }
    
    // Keyboard shortcut: Ctrl/Cmd + D for dark mode
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            toggleDarkMode();
        }
    });
}

function updateDarkModeButtons(isDark) {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');
    
    // Update desktop button
    if (darkModeToggle) {
        if (isDark) {
            darkModeToggle.innerHTML = '<span class="text-sm">☀️</span><span class="hidden xl:inline text-xs font-medium">Light</span>';
            darkModeToggle.title = 'Switch to Light Mode (Ctrl+D)';
            darkModeToggle.setAttribute('aria-label', 'Switch to light mode (keyboard shortcut: Ctrl+D)');
            darkModeToggle.className = 'bg-amber-500 text-white px-3 py-2 rounded-full shadow-lg hover:bg-amber-600 transition-all duration-300 flex items-center space-x-2';
        } else {
            darkModeToggle.innerHTML = '<span class="text-sm">🌙</span><span class="hidden xl:inline text-xs font-medium">Dark</span>';
            darkModeToggle.title = 'Switch to Dark Mode (Ctrl+D)';
            darkModeToggle.setAttribute('aria-label', 'Switch to dark mode (keyboard shortcut: Ctrl+D)');
            darkModeToggle.className = 'bg-slate-800 text-white px-3 py-2 rounded-full shadow-lg hover:bg-slate-900 transition-all duration-300 flex items-center space-x-2';
        }
    }
    
    // Update mobile button
    if (darkModeToggleMobile) {
        if (isDark) {
            darkModeToggleMobile.innerHTML = '<span class="text-lg">☀️</span><span class="font-medium">Switch to Light Mode</span><span class="text-xs opacity-75">(Ctrl+D)</span>';
            darkModeToggleMobile.className = 'w-full bg-amber-500 text-white px-4 py-3 rounded-lg hover:bg-amber-600 transition-all duration-300 flex items-center justify-center space-x-3';
        } else {
            darkModeToggleMobile.innerHTML = '<span class="text-lg">🌙</span><span class="font-medium">Toggle Dark Mode</span><span class="text-xs opacity-75">(Ctrl+D)</span>';
            darkModeToggleMobile.className = 'w-full bg-slate-800 text-white px-4 py-3 rounded-lg hover:bg-slate-900 transition-all duration-300 flex items-center justify-center space-x-3';
        }
    }
    
    // Refresh all visualizations with new colors after theme change
    setTimeout(() => {
        // Re-compute and redraw main visualization
        if (window.gramSchmidt && typeof window.gramSchmidt.compute === 'function') {
            window.gramSchmidt.compute();
        }
        
        // Redraw PSK waveforms with new colors
        if (window.gramSchmidt) {
            if (typeof window.gramSchmidt.drawBpskWaveform === 'function') {
                window.gramSchmidt.drawBpskWaveform();
            }
            if (typeof window.gramSchmidt.drawQpskWaveform === 'function') {
                window.gramSchmidt.drawQpskWaveform();
            }
            if (typeof window.gramSchmidt.drawPsk8Waveform === 'function') {
                window.gramSchmidt.drawPsk8Waveform();
            }
            if (typeof window.gramSchmidt.drawConstellationDiagrams === 'function') {
                window.gramSchmidt.drawConstellationDiagrams();
            }
        }
    }, 100);
}

function announceToScreenReader(message) {
    // Create invisible element for screen reader announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gramSchmidt = new GramSchmidt(); // Make globally accessible for theme changes
    initializeDarkMode(); // Initialize dark mode after DOM is ready
});
