// Digital Communication 101 - Interactive Visualizations
// By Affan Danish

// --- Mobile Menu ---
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
});

// --- Active Nav Link Scrolling ---
window.addEventListener('load', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length > 0 && navLinks.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active-nav');
                if (link.getAttribute('href').includes(current)) {
                    link.classList.add('active-nav');
                }
            });
        });
    }
});

// --- D3.js Visualizations ---

// Chart Dimensions
const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const getWidth = (selector) => {
    const element = document.querySelector(selector);
    return element ? element.clientWidth - margin.left - margin.right : 500;
};
const height = 250 - margin.top - margin.bottom;

// --- 1. Sampling Demo ---
function initializeSamplingDemo() {
    const samplingSlider = document.getElementById('sampling-slider');
    const samplingRateLabel = document.getElementById('sampling-rate-label');
    
    if (!samplingSlider || !samplingRateLabel) return;
    
    let samplingSvg;

    function drawSamplingChart() {
        const width = getWidth('#sampling-chart');
        d3.select("#sampling-chart").html(""); // Clear previous
        samplingSvg = d3.select("#sampling-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const trueFrequency = 2; // 2 Hz sine wave
        const sampleRate = +samplingSlider.value;
        samplingRateLabel.textContent = `${sampleRate} Hz`;

        const xScale = d3.scaleLinear().domain([0, 2]).range([0, width]);
        const yScale = d3.scaleLinear().domain([-1.1, 1.1]).range([height, 0]);

        samplingSvg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => d + "s"));
        samplingSvg.append("g").call(d3.axisLeft(yScale).ticks(5));
        
        // Draw axis-zero line
        samplingSvg.append("line")
            .style("stroke", "#ccc")
            .style("stroke-dasharray", "2,2")
            .attr("x1", 0).attr("y1", yScale(0))
            .attr("x2", width).attr("y2", yScale(0));

        const continuousData = d3.range(0, 2, 0.01).map(t => ({ t, y: Math.sin(2 * Math.PI * trueFrequency * t) }));
        const sampledData = d3.range(0, 2 + 1/sampleRate, 1/sampleRate).map(t => ({ t, y: Math.sin(2 * Math.PI * trueFrequency * t) }));

        const line = d3.line()
            .x(d => xScale(d.t))
            .y(d => yScale(d.y));

        // Continuous signal
        samplingSvg.append("path")
            .datum(continuousData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 0.4)
            .attr("d", line);

        // Sampled line
        samplingSvg.append("path")
            .datum(sampledData)
            .attr("class", "sampled-line")
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "4,4")
            .attr("d", line);

        // Sampled points
        samplingSvg.selectAll(".sample-dot")
            .data(sampledData)
            .enter().append("circle")
            .attr("class", "sample-dot")
            .attr("cx", d => xScale(d.t))
            .attr("cy", d => yScale(d.y))
            .attr("r", 4)
            .attr("fill", "red");
    }
    
    samplingSlider.addEventListener('input', drawSamplingChart);
    drawSamplingChart(); // Initial draw
}

// --- 2. Quantization Demo ---
function initializeQuantizationDemo() {
    const quantizationSlider = document.getElementById('quantization-slider');
    const quantizationRateLabel = document.getElementById('quantization-rate-label');
    
    if (!quantizationSlider || !quantizationRateLabel) return;
    
    let quantizationSvg;

    function drawQuantizationChart() {
        const width = getWidth('#quantization-chart');
        d3.select("#quantization-chart").html(""); // Clear previous
        quantizationSvg = d3.select("#quantization-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const bitDepth = +quantizationSlider.value;
        const levels = Math.pow(2, bitDepth);
        quantizationRateLabel.textContent = `${bitDepth}-bit (${levels} levels)`;
        
        const sampleRate = 20;
        const trueFrequency = 1;

        const xScale = d3.scaleLinear().domain([0, 2]).range([0, width]);
        const yScale = d3.scaleLinear().domain([-1.1, 1.1]).range([height, 0]);

        quantizationSvg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => d + "s"));
        quantizationSvg.append("g").call(d3.axisLeft(yScale).ticks(5));

        const continuousData = d3.range(0, 2, 0.01).map(t => ({ t, y: Math.sin(2 * Math.PI * trueFrequency * t) }));
        const sampledData = d3.range(0, 2 + 1/sampleRate, 1/sampleRate).map(t => ({ t, y: Math.sin(2 * Math.PI * trueFrequency * t) }));
        
        const quantizationLevels = d3.range(levels).map(i => -1 + (2 * i / (levels - 1)));
        const quantizer = y => {
            let closest = quantizationLevels[0];
            for(let level of quantizationLevels) {
                if (Math.abs(y - level) < Math.abs(y - closest)) {
                    closest = level;
                }
            }
            return closest;
        };

        const line = d3.line().x(d => xScale(d.t)).y(d => yScale(d.y));

        // Continuous signal
        quantizationSvg.append("path")
            .datum(continuousData)
            .attr("fill", "none").attr("stroke", "steelblue").attr("stroke-width", 1.5)
            .attr("stroke-opacity", 0.4).attr("d", line);

        // Quantization levels
        quantizationSvg.selectAll(".quant-level")
            .data(quantizationLevels)
            .enter().append("line")
            .attr("class", "quant-level")
            .style("stroke", "#ccc").style("stroke-dasharray", "2,2")
            .attr("x1", 0).attr("y1", d => yScale(d))
            .attr("x2", width).attr("y2", d => yScale(d));

        // Quantized points
        quantizationSvg.selectAll(".quant-dot")
            .data(sampledData)
            .enter().append("circle")
            .attr("class", "quant-dot")
            .attr("cx", d => xScale(d.t))
            .attr("cy", d => yScale(quantizer(d.y)))
            .attr("r", 4).attr("fill", "red");
    }
    
    quantizationSlider.addEventListener('input', drawQuantizationChart);
    drawQuantizationChart(); // Initial draw
}

// --- 3. Binary Converter ---
function initializeBinaryConverter() {
    const decimalInput = document.getElementById('decimal-input');
    const convertBtn = document.getElementById('convert-btn');
    const binaryOutput = document.getElementById('binary-output');
    const conversionSteps = document.getElementById('conversion-steps');

    if (!decimalInput || !convertBtn || !binaryOutput || !conversionSteps) return;

    function convertToBinary() {
        const num = parseInt(decimalInput.value);
        if (isNaN(num) || num < 0 || num > 255) {
            binaryOutput.textContent = 'Invalid';
            conversionSteps.innerHTML = '<p class="text-red-600">Please enter a number between 0 and 255.</p>';
            return;
        }

        // Check for Easter Egg sequence
        asciiSequence.push(num);
        if (asciiSequence.length > targetSequence.length) {
            asciiSequence = asciiSequence.slice(-targetSequence.length);
        }
        
        // Check if sequence matches
        if (JSON.stringify(asciiSequence) === JSON.stringify(targetSequence)) {
            setTimeout(() => {
                decodeHiddenMessage();
            }, 500);
            asciiSequence = []; // Reset sequence
        }

        binaryOutput.textContent = num.toString(2).padStart(8, '0');
        
        let stepsHtml = `<h4>Conversion Steps for ${num}:</h4>`;
        
        // Add ASCII hint if it's a printable character
        if (num >= 32 && num <= 126) {
            const char = String.fromCharCode(num);
            stepsHtml += `<p class="text-blue-600 mb-2">💡 ASCII Character: '<strong>${char}</strong>' (decimal ${num})</p>`;
        }
        
        stepsHtml += '<ol class="list-decimal list-inside mt-2">';
        let remainder;
        let currentNum = num;
        if (num === 0) {
             stepsHtml += '<li>0 divided by 2 is 0 with a remainder of <strong>0</strong>.</li>';
        }
        while(currentNum > 0) {
            remainder = currentNum % 2;
            stepsHtml += `<li>${currentNum} ÷ 2 = ${Math.floor(currentNum/2)} with a remainder of <strong>${remainder}</strong>.</li>`;
            currentNum = Math.floor(currentNum / 2);
        }
        stepsHtml += '</ol><p class="mt-2">Read the remainders from bottom to top to get the binary number. Then, pad with leading zeros to make it 8 bits long.</p>';
        
        // Add Easter egg progress hint
        if (asciiSequence.length > 0) {
            const chars = asciiSequence.map(n => String.fromCharCode(n)).join('');
            stepsHtml += `<div class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p class="text-xs text-yellow-700">🔍 ASCII sequence building: "${chars}" (${asciiSequence.length}/${targetSequence.length})</p>
            </div>`;
        }
        
        conversionSteps.innerHTML = stepsHtml;
    }
    
    // Enhanced Hidden Message Function - COMPLETED
    function decodeHiddenMessage() {
        easterEggsFound = Math.max(easterEggsFound, 4);
        updateEggCounter();
        
        const binaryMessage = "01000001 01100110 01100110 01100001 01101110 00100000 01110111 01100001 01110011 00100000 01101000 01100101 01110010 01100101 00100001";
        const decoded = binaryMessage.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
        
        // Enhanced alert with more information
        const alertMessage = `🔓 BINARY SECRET DECODED! 🔓

You successfully entered the ASCII sequence:
65 → 'A'
102 → 'f' 
102 → 'f'
97 → 'a'
110 → 'n'

Hidden Binary Message:
${binaryMessage}

Decoded Message: "${decoded}"

🎉 Congratulations! You found Easter Egg #4! 🥚
This demonstrates how ASCII encoding works in digital systems.`;

        alert(alertMessage);
        
        // Visual feedback on the converter
        const converterDiv = document.querySelector('#encoding .border.rounded-lg');
        if (converterDiv) {
            converterDiv.style.border = '2px solid #10b981';
            converterDiv.style.background = 'linear-gradient(135deg, #ecfdf5, #f0fdf4)';
            setTimeout(() => {
                converterDiv.style.border = '';
                converterDiv.style.background = '';
            }, 3000);
        }
    }

    convertBtn.addEventListener('click', convertToBinary);
    decimalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') convertToBinary();
    });
}

// --- 4. Live Demo ---
function initializeLiveDemo() {
    const liveSamplingSlider = document.getElementById('live-sampling-slider');
    const liveQuantizationSlider = document.getElementById('live-quantization-slider');
    const liveSamplingLabel = document.getElementById('live-sampling-label');
    const liveQuantizationLabel = document.getElementById('live-quantization-label');
    const liveBinaryOutput = document.getElementById('live-binary-output');
    
    if (!liveSamplingSlider || !liveQuantizationSlider) return;
    
    let liveDemoSvg;

    function drawLiveDemo() {
        const width = getWidth('#live-demo-chart');
        d3.select("#live-demo-chart").html(""); // Clear previous
        liveDemoSvg = d3.select("#live-demo-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        const sampleRate = +liveSamplingSlider.value;
        const bitDepth = +liveQuantizationSlider.value;
        const levels = Math.pow(2, bitDepth);
        
        if (liveSamplingLabel) liveSamplingLabel.textContent = `${sampleRate} Hz`;
        if (liveQuantizationLabel) liveQuantizationLabel.textContent = `${bitDepth}-bit`;

        const trueFrequency = 2;
        const xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);
        const yScale = d3.scaleLinear().domain([-1.1, 1.1]).range([height, 0]);

        liveDemoSvg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => d + "s"));
        liveDemoSvg.append("g").call(d3.axisLeft(yScale).ticks(5));

        const quantizationLevels = d3.range(levels).map(i => -1 + (2 * i / (levels - 1)));
        const quantizer = y => {
            let closest = quantizationLevels[0];
            for(let level of quantizationLevels) {
                if (Math.abs(y - level) < Math.abs(y - closest)) {
                    closest = level;
                }
            }
            return closest;
        };

        const continuousData = d3.range(0, 1, 0.005).map(t => ({ t, y: Math.sin(2 * Math.PI * trueFrequency * t) }));
        const sampledData = d3.range(0, 1, 1/sampleRate).map(t => ({ t, y: Math.sin(2 * Math.PI * trueFrequency * t) }));
        const quantizedData = sampledData.map(d => ({ t: d.t, y: quantizer(d.y) }));
        
        const line = d3.line().x(d => xScale(d.t)).y(d => yScale(d.y));

        // Continuous signal
        liveDemoSvg.append("path")
            .datum(continuousData)
            .attr("fill", "none").attr("stroke", "steelblue").attr("stroke-width", 1.5)
            .attr("stroke-opacity", 0.4).attr("d", line);

        // Quantized steps
        const stepLine = d3.line()
            .x(d => xScale(d.t))
            .y(d => yScale(d.y))
            .curve(d3.curveStepAfter);
        liveDemoSvg.append("path")
            .datum(quantizedData)
            .attr("fill", "none").attr("stroke", "red").attr("stroke-width", 1.5)
            .attr("d", stepLine);
        
        // Quantized points
        liveDemoSvg.selectAll(".quant-dot")
            .data(quantizedData)
            .enter().append("circle")
            .attr("class", "quant-dot")
            .attr("cx", d => xScale(d.t))
            .attr("cy", d => yScale(d.y))
            .attr("r", 4).attr("fill", "red");

        // Update binary output
        if (liveBinaryOutput) {
            let binaryString = '';
            const levelMap = new Map(quantizationLevels.map((val, i) => [val, i]));

            quantizedData.forEach(d => {
                const levelIndex = levelMap.get(d.y);
                if (levelIndex !== undefined) {
                    binaryString += levelIndex.toString(2).padStart(bitDepth, '0') + ' ';
                }
            });
            liveBinaryOutput.textContent = binaryString;
        }
    }
    
    liveSamplingSlider.addEventListener('input', drawLiveDemo);
    liveQuantizationSlider.addEventListener('input', drawLiveDemo);
    drawLiveDemo(); // Initial draw
}

// --- Modulation Visualizations ---
function initializeModulationDemos() {
    // ASK Visualization
    initializeAskDemo();
    // FSK Visualization  
    initializeFskDemo();
    // PSK Visualization
    initializePskDemo();
    // Constellation Diagrams
    initializeConstellationDiagrams();
}

function initializeAskDemo() {
    const askInputs = {
        bitSeq: document.getElementById('ask-bit-sequence'),
        carrierFreq: document.getElementById('ask-carrier-freq')
    };
    const askCarrierLabel = document.getElementById('ask-carrier-label');
    const updateAskBtn = document.getElementById('update-ask');

    if (!askInputs.bitSeq || !updateAskBtn) return;

    function drawAskChart() {
        const width = getWidth('#ask-chart');
        const height = 200;
        
        d3.select("#ask-chart").html("");
        const askSvg = d3.select("#ask-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const bitSequence = askInputs.bitSeq.value;
        const carrierFreq = +askInputs.carrierFreq.value;
        if (askCarrierLabel) askCarrierLabel.textContent = `${carrierFreq} Hz`;

        const bitDuration = 1;
        const totalTime = bitSequence.length * bitDuration;
        
        const xScale = d3.scaleLinear().domain([0, totalTime]).range([0, width]);
        const yScale = d3.scaleLinear().domain([-1.5, 1.5]).range([height, 0]);

        // Axes
        askSvg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).ticks(bitSequence.length));
        askSvg.append("g").call(d3.axisLeft(yScale).ticks(5));

        // Digital data
        const digitalData = [];
        for (let i = 0; i < bitSequence.length; i++) {
            const bit = parseInt(bitSequence[i]);
            digitalData.push({t: i * bitDuration, y: bit});
            digitalData.push({t: (i + 1) * bitDuration, y: bit});
        }

        const digitalLine = d3.line()
            .x(d => xScale(d.t))
            .y(d => yScale(d.y * 1.2 - 0.6));

        askSvg.append("path")
            .datum(digitalData)
            .attr("fill", "none")
            .attr("stroke", "#64748b")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "3,3")
            .attr("d", digitalLine);

        // ASK modulated signal
        const modulatedData = [];
        for (let t = 0; t <= totalTime; t += 0.01) {
            const bitIndex = Math.floor(t / bitDuration);
            const bit = bitIndex < bitSequence.length ? parseInt(bitSequence[bitIndex]) : 0;
            const amplitude = bit ? 1 : 0.3;
            modulatedData.push({
                t: t,
                y: amplitude * Math.cos(2 * Math.PI * carrierFreq * t)
            });
        }

        const modulatedLine = d3.line()
            .x(d => xScale(d.t))
            .y(d => yScale(d.y));

        askSvg.append("path")
            .datum(modulatedData)
            .attr("fill", "none")
            .attr("stroke", "#dc2626")
            .attr("stroke-width", 1.5)
            .attr("d", modulatedLine);
    }

    updateAskBtn.addEventListener('click', drawAskChart);
    drawAskChart(); // Initial draw
}

function initializeFskDemo() {
    const fskInputs = {
        bitSeq: document.getElementById('fsk-bit-sequence'),
        freq0: document.getElementById('fsk-freq0'),
        freq1: document.getElementById('fsk-freq1')
    };
    const fskFreq0Label = document.getElementById('fsk-freq0-label');
    const fskFreq1Label = document.getElementById('fsk-freq1-label');
    const updateFskBtn = document.getElementById('update-fsk');

    if (!fskInputs.bitSeq || !updateFskBtn) return;

    function drawFskChart() {
        const width = getWidth('#fsk-chart');
        const height = 200;
        
        d3.select("#fsk-chart").html("");
        const fskSvg = d3.select("#fsk-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const bitSequence = fskInputs.bitSeq.value;
        const freq0 = +fskInputs.freq0.value;
        const freq1 = +fskInputs.freq1.value;
        
        if (fskFreq0Label) fskFreq0Label.textContent = `${freq0} Hz`;
        if (fskFreq1Label) fskFreq1Label.textContent = `${freq1} Hz`;

        const bitDuration = 1;
        const totalTime = bitSequence.length * bitDuration;
        
        const xScale = d3.scaleLinear().domain([0, totalTime]).range([0, width]);
        const yScale = d3.scaleLinear().domain([-1.5, 1.5]).range([height, 0]);

        fskSvg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).ticks(bitSequence.length));
        fskSvg.append("g").call(d3.axisLeft(yScale).ticks(5));

        // Digital data
        const digitalData = [];
        for (let i = 0; i < bitSequence.length; i++) {
            const bit = parseInt(bitSequence[i]);
            digitalData.push({t: i * bitDuration, y: bit});
            digitalData.push({t: (i + 1) * bitDuration, y: bit});
        }

        const digitalLine = d3.line()
            .x(d => xScale(d.t))
            .y(d => yScale(d.y * 1.2 - 0.6));

        fskSvg.append("path")
            .datum(digitalData)
            .attr("fill", "none")
            .attr("stroke", "#64748b")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "3,3")
            .attr("d", digitalLine);

        // FSK modulated signal
        const modulatedData = [];
        for (let t = 0; t <= totalTime; t += 0.01) {
            const bitIndex = Math.floor(t / bitDuration);
            const bit = bitIndex < bitSequence.length ? parseInt(bitSequence[bitIndex]) : 0;
            const frequency = bit ? freq1 : freq0;
            modulatedData.push({
                t: t,
                y: Math.cos(2 * Math.PI * frequency * t)
            });
        }

        const modulatedLine = d3.line()
            .x(d => xScale(d.t))
            .y(d => yScale(d.y));

        fskSvg.append("path")
            .datum(modulatedData)
            .attr("fill", "none")
            .attr("stroke", "#7c3aed")
            .attr("stroke-width", 1.5)
            .attr("d", modulatedLine);
    }

    updateFskBtn.addEventListener('click', drawFskChart);
    drawFskChart(); // Initial draw
}

function initializePskDemo() {
    const pskInputs = {
        bitSeq: document.getElementById('psk-bit-sequence'),
        carrierFreq: document.getElementById('psk-carrier-freq'),
        type: document.getElementById('psk-type')
    };
    const pskCarrierLabel = document.getElementById('psk-carrier-label');
    const updatePskBtn = document.getElementById('update-psk');

    if (!pskInputs.bitSeq || !updatePskBtn) return;

    function drawPskChart() {
        const width = getWidth('#psk-chart');
        const height = 200;
        
        d3.select("#psk-chart").html("");
        const pskSvg = d3.select("#psk-chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const bitSequence = pskInputs.bitSeq.value;
        const carrierFreq = +pskInputs.carrierFreq.value;
        const pskType = pskInputs.type.value;
        
        if (pskCarrierLabel) pskCarrierLabel.textContent = `${carrierFreq} Hz`;

        const bitDuration = 1;
        const totalTime = bitSequence.length * bitDuration;
        
        const xScale = d3.scaleLinear().domain([0, totalTime]).range([0, width]);
        const yScale = d3.scaleLinear().domain([-1.5, 1.5]).range([height, 0]);

        pskSvg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).ticks(bitSequence.length));
        pskSvg.append("g").call(d3.axisLeft(yScale).ticks(5));

        // Digital data
        const digitalData = [];
        for (let i = 0; i < bitSequence.length; i++) {
            const bit = parseInt(bitSequence[i]);
            digitalData.push({t: i * bitDuration, y: bit});
            digitalData.push({t: (i + 1) * bitDuration, y: bit});
        }

        const digitalLine = d3.line()
            .x(d => xScale(d.t))
            .y(d => yScale(d.y * 1.2 - 0.6));

        pskSvg.append("path")
            .datum(digitalData)
            .attr("fill", "none")
            .attr("stroke", "#64748b")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "3,3")
            .attr("d", digitalLine);

        // PSK modulated signal
        const modulatedData = [];
        for (let t = 0; t <= totalTime; t += 0.01) {
            const bitIndex = Math.floor(t / bitDuration);
            const bit = bitIndex < bitSequence.length ? parseInt(bitSequence[bitIndex]) : 0;
            let phase = 0;
            
            if (pskType === 'BPSK') {
                phase = bit ? 0 : Math.PI;
            } else if (pskType === 'QPSK') {
                // For QPSK, process 2 bits at a time
                const evenBitIndex = Math.floor(bitIndex / 2) * 2;
                const bit1 = evenBitIndex < bitSequence.length ? parseInt(bitSequence[evenBitIndex]) : 0;
                const bit2 = evenBitIndex + 1 < bitSequence.length ? parseInt(bitSequence[evenBitIndex + 1]) : 0;
                const symbol = bit1 * 2 + bit2; // 00, 01, 10, 11 -> 0, 1, 2, 3
                phase = symbol * Math.PI / 2;
            }
            
            modulatedData.push({
                t: t,
                y: Math.cos(2 * Math.PI * carrierFreq * t + phase)
            });
        }

        const modulatedLine = d3.line()
            .x(d => xScale(d.t))
            .y(d => yScale(d.y));

        pskSvg.append("path")
            .datum(modulatedData)
            .attr("fill", "none")
            .attr("stroke", "#10b981")
            .attr("stroke-width", 1.5)
            .attr("d", modulatedLine);
    }

    updatePskBtn.addEventListener('click', drawPskChart);
    drawPskChart(); // Initial draw
}

function initializeConstellationDiagrams() {
    drawBpskConstellation();
    drawQpskConstellation(); 
    drawPsk8Constellation();
}

function drawBpskConstellation() {
    const canvas = document.getElementById('bpsk-constellation');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const size = 120;
    const center = size / 2;
    const radius = 40;

    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    // Grid and axes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, center); ctx.lineTo(size, center);
    ctx.moveTo(center, 0); ctx.lineTo(center, size);
    ctx.stroke();

    // BPSK points (2 points at 0° and 180°)
    const bpskPoints = [
        {x: center + radius, y: center, label: '1'},
        {x: center - radius, y: center, label: '0'}
    ];

    ctx.fillStyle = '#10b981';
    bpskPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#2d3748';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(point.label, point.x - 4, point.y - 8);
        ctx.fillStyle = '#10b981';
    });
}

function drawQpskConstellation() {
    const canvas = document.getElementById('qpsk-constellation');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const size = 120;
    const center = size / 2;
    const radius = 40;

    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    // Grid and axes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, center); ctx.lineTo(size, center);
    ctx.moveTo(center, 0); ctx.lineTo(center, size);
    ctx.stroke();

    // QPSK points (4 points at 45°, 135°, 225°, 315°)
    const qpskPoints = [
        {angle: Math.PI/4, label: '00'}, {angle: 3*Math.PI/4, label: '01'},
        {angle: 5*Math.PI/4, label: '11'}, {angle: 7*Math.PI/4, label: '10'}
    ];
    
    ctx.fillStyle = '#3b82f6';
    qpskPoints.forEach(point => {
        const x = center + radius * Math.cos(point.angle);
        const y = center - radius * Math.sin(point.angle);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#2d3748';
        ctx.font = '10px Arial';
        ctx.fillText(point.label, x - 8, y - 8);
        ctx.fillStyle = '#3b82f6';
    });
}

function drawPsk8Constellation() {
    const canvas = document.getElementById('8psk-constellation');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const size = 120;
    const center = size / 2;
    const radius = 40;

    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    // Grid and axes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, center); ctx.lineTo(size, center);
    ctx.moveTo(center, 0); ctx.lineTo(center, size);
    ctx.stroke();

    // 8-PSK points
    const labels = ['000', '001', '011', '010', '110', '111', '101', '100'];
    
    ctx.fillStyle = '#8b5cf6';
    for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4;
        const x = center + radius * Math.cos(angle);
        const y = center - radius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#2d3748';
        ctx.font = '8px Arial';
        ctx.fillText(labels[i], x - 10, y - 8);
        ctx.fillStyle = '#8b5cf6';
    }
}

// --- Easter Egg Functions ---
let easterEggsFound = 0;
let currentQuoteIndex = 0;

const quotes = [
    {
        text: "The fundamental problem of communication is that of reproducing at one point either exactly or approximately a message selected at another point.",
        author: "Claude Shannon"
    },
    {
        text: "Information is the resolution of uncertainty.",
        author: "Claude Shannon"
    },
    {
    text: "Claude Shannon (1916-2001) is known as the 'Father of Information Theory'. His 1948 paper 'A Mathematical Theory of Communication' laid the foundation for digital communications, data compression, and error correction!",
    author: "Affan"
    },
    {
        text: "A mathematician is a device for turning coffee into theorems.",
        author: "Paul Erdős"
    },
    {
        text: "The best way to learn is to do; the worst way to teach is to talk.",
        author: "Paul Halmos"
    }
];

function showShannonQuote() {
    easterEggsFound = Math.max(easterEggsFound, 1);
    updateEggCounter();
    alert("🎉 Easter Egg Found! 🎉\n\nClaude Shannon (1916-2001) is known as the 'Father of Information Theory'. His 1948 paper 'A Mathematical Theory of Communication' laid the foundation for digital communications, data compression, and error correction!");
}

function cycleThroughQuotes() {
    easterEggsFound = Math.max(easterEggsFound, 2);
    updateEggCounter();
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    const quote = quotes[currentQuoteIndex];
    const quoteElement = document.getElementById('rotating-quote');
    const authorElement = document.getElementById('quote-author');
    if (quoteElement && authorElement) {
        quoteElement.textContent = `"${quote.text}"`;
        authorElement.textContent = quote.author;
    }
}

function showDeveloperMessage() {
    easterEggsFound = Math.max(easterEggsFound, 3);
    updateEggCounter();
    const messages = [
        "Thanks for exploring! 🚀",
        "You're curious - I like that! 🤔",
        "Keep learning and stay awesome! ⭐",
        "Digital communication is everywhere - even in this message! 📡",
        "Fun fact: This website teaches real DSP concepts! 💻"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    alert(`👋 Message from Affan:\n\n${randomMessage}`);
}

function updateEggCounter() {
    const counter = document.getElementById('egg-counter');
    if (counter) {
        counter.textContent = easterEggsFound;
    }
}

// Enhanced Konami Code Easter Egg - More accessible
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

// Visual feedback for Konami Code progress
let konamiProgress = 0;
let konamiTimeout;

document.addEventListener('keydown', function(e) {
    // Add the pressed key to sequence
    konamiCode.push(e.code);
    
    // Check if current input matches expected sequence
    if (konamiCode[konamiCode.length - 1] === konamiSequence[konamiCode.length - 1]) {
        konamiProgress = konamiCode.length;
        showKonamiProgress(konamiProgress, konamiSequence.length);
        
        // Reset timeout for sequence
        clearTimeout(konamiTimeout);
        konamiTimeout = setTimeout(() => {
            resetKonamiSequence();
        }, 3000); // Increased timeout to 3 seconds
        
        // Check if complete sequence entered
        if (konamiCode.length === konamiSequence.length) {
            easterEggsFound = Math.max(easterEggsFound, 6);
            updateEggCounter();
            activateMatrixMode();
            resetKonamiSequence();
        }
    } else {
        // Wrong key, reset sequence
        resetKonamiSequence();
    }
    
    // Keep only last 10 keys to prevent memory issues
    if (konamiCode.length > konamiSequence.length) {
        konamiCode = konamiCode.slice(-konamiSequence.length);
    }
});

function resetKonamiSequence() {
    konamiCode = [];
    konamiProgress = 0;
    hideKonamiProgress();
    clearTimeout(konamiTimeout);
}

function showKonamiProgress(current, total) {
    let progressDiv = document.getElementById('konami-progress');
    if (!progressDiv) {
        progressDiv = document.createElement('div');
        progressDiv.id = 'konami-progress';
        progressDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(20, 20, 50, 0.9));
            color: #00ff00;
            padding: 15px 20px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            z-index: 10000;
            transition: all 0.3s ease;
            border: 1px solid #00ff00;
            box-shadow: 0 4px 20px rgba(0, 255, 0, 0.3);
        `;
        document.body.appendChild(progressDiv);
    }
    
    const percentage = (current / total * 100).toFixed(0);
    progressDiv.innerHTML = `
        <div style="text-align: center;">
            <div style="font-weight: bold; margin-bottom: 8px;">🎮 KONAMI CODE</div>
            <div style="font-size: 12px; margin-bottom: 5px;">Progress: ${current}/${total} (${percentage}%)</div>
            <div style="background: rgba(0, 0, 0, 0.5); border-radius: 10px; padding: 5px;">
                ${'█'.repeat(current)}${'░'.repeat(total - current)}
            </div>
            <div style="font-size: 10px; margin-top: 5px; opacity: 0.8;">
                ${current < total ? 'Keep going! ↑↑↓↓←→←→BA' : 'COMPLETE! Matrix Mode Activated! 🎉'}
            </div>
        </div>
    `;
    progressDiv.style.opacity = '1';
    
    // Add pulsing effect when near completion
    if (current > total - 3) {
        progressDiv.style.animation = 'pulse 0.5s infinite';
    }
}

function hideKonamiProgress() {
    const progressDiv = document.getElementById('konami-progress');
    if (progressDiv) {
        progressDiv.style.opacity = '0';
        setTimeout(() => {
            if (progressDiv.parentNode) {
                progressDiv.parentNode.removeChild(progressDiv);
            }
        }, 300);
    }
}

// Enhanced Matrix Mode
function activateMatrixMode() {
    // Clear any existing matrix mode
    const existingCanvas = document.getElementById('matrix-canvas');
    if (existingCanvas) {
        existingCanvas.remove();
    }

    // Layering contract: canvas above page background, below all content
    // Do NOT alter the body background; keep the dotted pattern intact
    // We'll ensure content stays above by giving <main> a higher stacking context
    const mainEl = document.querySelector('main');
    const footerEl = document.querySelector('footer');
    const restoreMain = mainEl ? { position: mainEl.style.position, zIndex: mainEl.style.zIndex } : null;
    const restoreFooter = footerEl ? { position: footerEl.style.position, zIndex: footerEl.style.zIndex } : null;
    if (mainEl) {
        mainEl.style.position = mainEl.style.position || 'relative';
        mainEl.style.zIndex = '2';
    }
    if (footerEl) {
        footerEl.style.position = footerEl.style.position || 'relative';
        footerEl.style.zIndex = '2';
    }
    
    // Enhanced activation message
    const matrixAlert = document.createElement('div');
    matrixAlert.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.95);
        color: #00ff00;
        padding: 30px 50px;
        border: 2px solid #00ff00;
        border-radius: 15px;
        font-family: 'Courier New', monospace;
        font-size: 20px;
        text-align: center;
        z-index: 10001;
        box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
        animation: matrixGlow 2s infinite;
    `;
    matrixAlert.innerHTML = `
        <div style="font-size: 28px; margin-bottom: 15px; text-shadow: 0 0 10px #00ff00;">🎮 KONAMI CODE ACTIVATED! 🎮</div>
        <div style="margin-bottom: 10px;">Welcome to the Matrix!</div>
        <div style="font-size: 14px; margin-top: 15px; opacity: 0.8;">
            You found Easter Egg #6! 🥚<br>
            Matrix mode will run for 15 seconds...
        </div>
    `;
    
    // Add matrix glow animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes matrixGlow {
            0%, 100% { box-shadow: 0 0 30px rgba(0, 255, 0, 0.5); }
            50% { box-shadow: 0 0 50px rgba(0, 255, 0, 0.8), 0 0 80px rgba(0, 255, 0, 0.3); }
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(matrixAlert);
    
    // Remove alert after 5 seconds
    setTimeout(() => {
        if (matrixAlert.parentNode) {
            matrixAlert.remove();
        }
    }, 5000);
    
    // Enhanced Matrix rain effect
    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-canvas';
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1; /* Above background, below most UI */
        pointer-events: none;
    `;
    document.body.appendChild(canvas);
    
    // Matrix rain effect
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const drops = [];
    const columns = Math.floor(canvas.width / 20);
    
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * canvas.height;
    }
    
    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = '20px Courier New';
        
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * 20, drops[i]);
            drops[i] += 20;
            
            if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
        }
    }
    
    const matrixInterval = setInterval(drawMatrix, 50);
    
    // Auto-cleanup after 15 seconds
    setTimeout(() => {
        clearInterval(matrixInterval);
        if (canvas.parentNode) {
            canvas.remove();
        }
        // Restore any temporary styles on main
        if (restoreMain && mainEl) {
            mainEl.style.position = restoreMain.position;
            mainEl.style.zIndex = restoreMain.zIndex;
        }
        if (restoreFooter && footerEl) {
            footerEl.style.position = restoreFooter.position;
            footerEl.style.zIndex = restoreFooter.zIndex;
        }
        if (style.parentNode) {
            style.remove();
        }
    }, 15000);
}

// Binary Converter with Easter Egg - COMPLETE IMPLEMENTATION
const decimalInput = document.getElementById('decimal-input');
const convertBtn = document.getElementById('convert-btn');
const binaryOutput = document.getElementById('binary-output');
const conversionSteps = document.getElementById('conversion-steps');

// Track ASCII sequence for hidden message
let asciiSequence = [];
const targetSequence = [65, 102, 102, 97, 110]; // "Affan" in ASCII

function convertToBinary() {
    const num = parseInt(decimalInput.value);
    if (isNaN(num) || num < 0 || num > 255) {
        binaryOutput.textContent = 'Invalid';
        conversionSteps.innerHTML = '<p class="text-red-600">Please enter a number between 0 and 255.</p>';
        return;
    }

    // Check for Easter Egg sequence
    asciiSequence.push(num);
    if (asciiSequence.length > targetSequence.length) {
        asciiSequence = asciiSequence.slice(-targetSequence.length);
    }
    
    // Check if sequence matches
    if (JSON.stringify(asciiSequence) === JSON.stringify(targetSequence)) {
        setTimeout(() => {
            decodeHiddenMessage();
        }, 500);
        asciiSequence = []; // Reset sequence
    }

    binaryOutput.textContent = num.toString(2).padStart(8, '0');
    
    let stepsHtml = `<h4>Conversion Steps for ${num}:</h4>`;
    
    // Add ASCII hint if it's a printable character
    if (num >= 32 && num <= 126) {
        const char = String.fromCharCode(num);
        stepsHtml += `<p class="text-blue-600 mb-2">💡 ASCII Character: '<strong>${char}</strong>' (decimal ${num})</p>`;
    }
    
    stepsHtml += '<ol class="list-decimal list-inside mt-2">';
    let remainder;
    let currentNum = num;
    if (num === 0) {
         stepsHtml += '<li>0 divided by 2 is 0 with a remainder of <strong>0</strong>.</li>';
    }
    while(currentNum > 0) {
        remainder = currentNum % 2;
        stepsHtml += `<li>${currentNum} ÷ 2 = ${Math.floor(currentNum/2)} with a remainder of <strong>${remainder}</strong>.</li>`;
        currentNum = Math.floor(currentNum / 2);
    }
    stepsHtml += '</ol><p class="mt-2">Read the remainders from bottom to top to get the binary number. Then, pad with leading zeros to make it 8 bits long.</p>';
    
    // Add Easter egg progress hint
    if (asciiSequence.length > 0) {
        const chars = asciiSequence.map(n => String.fromCharCode(n)).join('');
        stepsHtml += `<div class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p class="text-xs text-yellow-700">🔍 ASCII sequence building: "${chars}" (${asciiSequence.length}/${targetSequence.length})</p>
        </div>`;
    }
    
    conversionSteps.innerHTML = stepsHtml;
}

// Enhanced Hidden Message Function - COMPLETED
function decodeHiddenMessage() {
    easterEggsFound = Math.max(easterEggsFound, 4);
    updateEggCounter();
    
    const binaryMessage = "01000001 01100110 01100110 01100001 01101110 00100000 01110111 01100001 01110011 00100000 01101000 01100101 01110010 01100101 00100001";
    const decoded = binaryMessage.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
    
    // Enhanced alert with more information
    const alertMessage = `🔓 BINARY SECRET DECODED! 🔓

You successfully entered the ASCII sequence:
65 → 'A'
102 → 'f' 
102 → 'f'
97 → 'a'
110 → 'n'

Hidden Binary Message:
${binaryMessage}

Decoded Message: "${decoded}"

🎉 Congratulations! You found Easter Egg #4! 🥚
This demonstrates how ASCII encoding works in digital systems.`;

    alert(alertMessage);
    
    // Visual feedback on the converter
    const converterDiv = document.querySelector('#encoding .border.rounded-lg');
    if (converterDiv) {
        converterDiv.style.border = '2px solid #10b981';
        converterDiv.style.background = 'linear-gradient(135deg, #ecfdf5, #f0fdf4)';
        setTimeout(() => {
            converterDiv.style.border = '';
            converterDiv.style.background = '';
        }, 3000);
    }
}

// ========================================
// MODERN DARK MODE MANAGER
// Following DARK_MODE_ANALYSIS.md best practices
// ========================================

class DarkModeManager {
    constructor() {
        this.storageKey = 'theme-preference';
        this.attribute = 'data-theme';
        this.themes = { LIGHT: 'light', DARK: 'dark' };
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.initialized = false;
    }
    
    init() {
        if (this.initialized) return;
        
        // 1. Set initial theme (only touches documentElement)
        this.setTheme(this.getPreferredTheme());
        
        // 2. Listen for system changes
        this.mediaQuery.addEventListener('change', () => {
            if (!this.hasStoredPreference()) {
                this.setTheme(this.getSystemTheme());
                this.announceChange(`Automatically switched to ${this.getSystemTheme()} mode`);
            }
        });
        
        // 3. Setup toggle listeners
        this.bindToggleEvents();
        
        // 4. Setup keyboard shortcuts
        this.bindKeyboardShortcuts();
        
        this.initialized = true;
    }
    
    setTheme(theme) {
        try {
            // Only update documentElement (single source of truth)
            document.documentElement.setAttribute(this.attribute, theme);
            
            // Also add class for backwards compatibility (during transition)
            if (theme === this.themes.DARK) {
                document.documentElement.classList.add('dark-mode');
            } else {
                document.documentElement.classList.remove('dark-mode');
            }
            
            this.updateBrowserUI(theme);
        } catch (error) {
            console.warn('Theme setting failed:', error);
        }
    }
    
    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === this.themes.DARK ? this.themes.LIGHT : this.themes.DARK;
        
        this.setTheme(newTheme);
        this.storePreference(newTheme);
        this.updateButtons(newTheme);
        
        // Announce change
        this.announceChange(`${newTheme === this.themes.DARK ? 'Dark' : 'Light'} mode enabled`);
        
        // Selective chart updates (only visible ones)
        this.updateVisibleCharts();
        
        // Update accessibility status if needed
        if (typeof updateAccessibilityStatus === 'function') {
            updateAccessibilityStatus();
        }
    }
    
    updateVisibleCharts() {
        // ✅ IMPROVED - Only update charts that are actually visible
        // Use requestIdleCallback for better performance
        if (window.requestIdleCallback) {
            window.requestIdleCallback(() => {
                this.refreshVisibleCharts();
            });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
                this.refreshVisibleCharts();
            }, 50);
        }
    }
    
    refreshVisibleCharts() {
        // Only refresh charts that are visible and exist
        const chartRefreshers = [
            { name: 'initializeSamplingDemo', condition: () => document.getElementById('samplingChart') },
            { name: 'initializeQuantizationDemo', condition: () => document.getElementById('quantizationChart') },
            { name: 'initializeLiveDemo', condition: () => document.getElementById('liveChart') },
            { name: 'initializeModulationDemos', condition: () => document.querySelector('[id*="modulation"]') }
        ];
        
        chartRefreshers.forEach(refresher => {
            if (refresher.condition() && typeof window[refresher.name] === 'function') {
                try {
                    window[refresher.name]();
                } catch (error) {
                    console.warn(`Failed to refresh ${refresher.name}:`, error);
                }
            }
        });
    }
    
    bindToggleEvents() {
        const toggleElements = [
            document.getElementById('darkModeToggle'),
            document.getElementById('darkModeToggleMobile')
        ].filter(el => el !== null);
        
        toggleElements.forEach(element => {
            element.addEventListener('click', () => this.toggleTheme());
        });
        
        // Initialize button states
        this.updateButtons(this.getCurrentTheme());
    }
    
    bindKeyboardShortcuts() {
        // Keyboard shortcut: Ctrl/Cmd + D for dark mode
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }
    
    updateButtons(theme) {
        const isDark = theme === this.themes.DARK;
        
        // Update desktop button
        this.updateButton('darkModeToggle', isDark);
        
        // Update mobile button  
        this.updateButton('darkModeToggleMobile', isDark);
    }
    
    updateButton(buttonId, isDark) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        if (isDark) {
            button.innerHTML = buttonId.includes('Mobile') 
                ? '<span class="text-lg">☀️</span><span class="font-medium">Toggle Light Mode</span><span class="text-xs opacity-75">(Ctrl+D)</span>'
                : '<span class="text-sm">☀️</span><span class="hidden xl:inline text-xs font-medium">Light</span>';
            button.title = 'Switch to Light Mode (Ctrl+D)';
            button.setAttribute('aria-label', 'Switch to light mode (keyboard shortcut: Ctrl+D)');
            button.className = button.className.replace(/bg-slate-800|hover:bg-slate-900/, 'bg-amber-500 hover:bg-amber-600');
        } else {
            button.innerHTML = buttonId.includes('Mobile')
                ? '<span class="text-lg">🌙</span><span class="font-medium">Toggle Dark Mode</span><span class="text-xs opacity-75">(Ctrl+D)</span>'
                : '<span class="text-sm">🌙</span><span class="hidden xl:inline text-xs font-medium">Dark</span>';
            button.title = 'Switch to Dark Mode (Ctrl+D)';
            button.setAttribute('aria-label', 'Switch to dark mode (keyboard shortcut: Ctrl+D)');
            button.className = button.className.replace(/bg-amber-500|hover:bg-amber-600/, 'bg-slate-800 hover:bg-slate-900');
        }
    }
    
    updateBrowserUI(theme) {
        const isDark = theme === this.themes.DARK;
        
        // Update color scheme
        document.documentElement.style.colorScheme = theme;
        
        // Update theme-color meta tag
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', isDark ? '#0f172a' : '#dfdff3');
        }
    }
    
    announceChange(message) {
        if (typeof announceToScreenReader === 'function') {
            announceToScreenReader(message);
        }
    }
    
    // === UTILITY METHODS ===
    
    getCurrentTheme() {
        const current = document.documentElement.getAttribute(this.attribute);
        return current || this.themes.LIGHT;
    }
    
    getSystemTheme() {
        return this.mediaQuery.matches ? this.themes.DARK : this.themes.LIGHT;
    }
    
    getPreferredTheme() {
        const stored = this.getStoredPreference();
        return stored || this.getSystemTheme();
    }
    
    getStoredPreference() {
        try {
            return localStorage.getItem(this.storageKey);
        } catch {
            return null;
        }
    }
    
    storePreference(theme) {
        try {
            localStorage.setItem(this.storageKey, theme);
        } catch (error) {
            console.warn('Could not store theme preference:', error);
        }
    }
    
    hasStoredPreference() {
        return this.getStoredPreference() !== null;
    }
}

// Initialize the modern dark mode manager
function initializeDarkMode() {
    if (window.darkModeManager) {
        return; // Already initialized
    }
    
    window.darkModeManager = new DarkModeManager();
    window.darkModeManager.init();
}

// Legacy function for backwards compatibility
function updateDarkModeButtons(isDark) {
    // This function is kept for backwards compatibility during transition
    // The new system handles this automatically
    if (window.darkModeManager) {
        window.darkModeManager.updateButtons(isDark ? 'dark' : 'light');
    }
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
    
    // Refresh charts to apply dark mode colors
    setTimeout(() => {
        if (typeof initializeSamplingDemo === 'function') initializeSamplingDemo();
        if (typeof initializeQuantizationDemo === 'function') initializeQuantizationDemo();
        if (typeof initializeLiveDemo === 'function') initializeLiveDemo();
        if (typeof initializeModulationDemos === 'function') initializeModulationDemos();
    }, 100);
}

// --- Accessibility Menu Implementation ---
function initializeAccessibilityMenu() {
    const accessibilityToggle = document.getElementById('accessibilityToggle');
    const accessibilityMenu = document.getElementById('accessibilityMenu');
    const highContrastCheckbox = document.getElementById('highContrast');
    const largeTextCheckbox = document.getElementById('largeText');
    const reduceMotionCheckbox = document.getElementById('reduceMotion');
    const screenReaderCheckbox = document.getElementById('screenReader');

    if (!accessibilityToggle || !accessibilityMenu) return;

    // Toggle menu visibility
    accessibilityToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = accessibilityMenu.classList.contains('hidden');
        accessibilityMenu.classList.toggle('hidden');
        accessibilityToggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
        
        if (isHidden) {
            // Focus first checkbox when menu opens
            const firstCheckbox = accessibilityMenu.querySelector('input[type="checkbox"]');
            if (firstCheckbox) {
                setTimeout(() => firstCheckbox.focus(), 100);
            }
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!accessibilityMenu.contains(e.target) && !accessibilityToggle.contains(e.target)) {
            accessibilityMenu.classList.add('hidden');
            accessibilityToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Handle keyboard navigation
    accessibilityMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            accessibilityMenu.classList.add('hidden');
            accessibilityToggle.setAttribute('aria-expanded', 'false');
            accessibilityToggle.focus();
        }
    });

    // Load saved preferences
    loadAccessibilityPreferences();

    // High Contrast Mode
    if (highContrastCheckbox) {
        highContrastCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('high-contrast', highContrastCheckbox.checked);
            localStorage.setItem('accessibility-high-contrast', highContrastCheckbox.checked);
            updateAccessibilityStatus();
            announceToScreenReader(highContrastCheckbox.checked ? 'High contrast mode enabled' : 'High contrast mode disabled');
        });
    }

    // Large Text Mode
    if (largeTextCheckbox) {
        largeTextCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('large-text', largeTextCheckbox.checked);
            localStorage.setItem('accessibility-large-text', largeTextCheckbox.checked);
            updateAccessibilityStatus();
            announceToScreenReader(largeTextCheckbox.checked ? 'Large text mode enabled' : 'Large text mode disabled');
        });
    }

    // Reduce Motion
    if (reduceMotionCheckbox) {
        reduceMotionCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('reduce-motion', reduceMotionCheckbox.checked);
            localStorage.setItem('accessibility-reduce-motion', reduceMotionCheckbox.checked);
            updateAccessibilityStatus();
            announceToScreenReader(reduceMotionCheckbox.checked ? 'Reduced motion enabled' : 'Reduced motion disabled');
        });
    }

    // Screen Reader Mode
    if (screenReaderCheckbox) {
        screenReaderCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('screen-reader', screenReaderCheckbox.checked);
            localStorage.setItem('accessibility-screen-reader', screenReaderCheckbox.checked);
            updateAccessibilityStatus();
            announceToScreenReader(screenReaderCheckbox.checked ? 'Screen reader mode enabled' : 'Screen reader mode disabled');
        });
    }
}

function loadAccessibilityPreferences() {
    // Load and apply saved accessibility preferences
    const preferences = {
        'highContrast': localStorage.getItem('accessibility-high-contrast') === 'true',
        'largeText': localStorage.getItem('accessibility-large-text') === 'true',
        'reduceMotion': localStorage.getItem('accessibility-reduce-motion') === 'true',
        'screenReader': localStorage.getItem('accessibility-screen-reader') === 'true'
    };

    Object.keys(preferences).forEach(pref => {
        const checkbox = document.getElementById(pref);
        if (checkbox && preferences[pref]) {
            checkbox.checked = true;
            document.body.classList.add(pref.replace(/([A-Z])/g, '-$1').toLowerCase());
        }
    });

    // Also check system preferences for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduce-motion');
        const reduceMotionCheckbox = document.getElementById('reduceMotion');
        if (reduceMotionCheckbox) {
            reduceMotionCheckbox.checked = true;
        }
    }

    // Update status after loading preferences
    updateAccessibilityStatus();
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

function updateAccessibilityStatus() {
    // Update accessibility button to show active features
    const accessibilityToggle = document.getElementById('accessibilityToggle');
    if (!accessibilityToggle) return;
    
    const activeFeatures = [];
    if (document.body.classList.contains('high-contrast')) activeFeatures.push('High Contrast');
    if (document.body.classList.contains('large-text')) activeFeatures.push('Large Text');
    if (document.body.classList.contains('reduce-motion')) activeFeatures.push('Reduced Motion');
    if (document.body.classList.contains('screen-reader')) activeFeatures.push('Screen Reader');
    
    if (activeFeatures.length > 0) {
        accessibilityToggle.style.backgroundColor = '#059669'; // green-600
        accessibilityToggle.title = `Accessibility Options (Active: ${activeFeatures.join(', ')})`;
        accessibilityToggle.setAttribute('aria-label', `Accessibility options menu - ${activeFeatures.length} features active`);
    } else {
        accessibilityToggle.style.backgroundColor = '#2563eb'; // blue-600
        accessibilityToggle.title = 'Accessibility Options';
        accessibilityToggle.setAttribute('aria-label', 'Open accessibility options menu');
    }
}

// --- Initialize Everything ---
window.addEventListener('load', () => {
    initializeSamplingDemo();
    initializeQuantizationDemo();
    initializeBinaryConverter();
    initializeLiveDemo();
    initializeModulationDemos();
    initializeDarkMode();
    initializeAccessibilityMenu();
    
    // Initial quote
    if (typeof cycleThroughQuotes === 'function') {
        cycleThroughQuotes();
    }
});

window.addEventListener('resize', () => {
    // Redraw charts on resize
    setTimeout(() => {
        initializeSamplingDemo();
        initializeQuantizationDemo();
        initializeLiveDemo();
        initializeModulationDemos();
    }, 100);
});
