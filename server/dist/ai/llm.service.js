import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
/**
 * Unified LLM interface. Provider is selected via AI_PROVIDER env var.
 * - "mock"      : deterministic local responses (default, zero-config)
 * - "openai"    : OpenAI Chat Completions
 * - "anthropic" : Anthropic Messages API
 */
class LLMService {
    provider;
    model;
    constructor() {
        this.provider = env.AI_PROVIDER;
        this.model =
            this.provider === 'anthropic' ? env.ANTHROPIC_MODEL : env.OPENAI_MODEL;
    }
    async complete(messages, { temperature = 0.4, maxTokens = 1500 } = {}) {
        const started = Date.now();
        let content;
        switch (this.provider) {
            case 'openai':
                content = await this._completeOpenAI(messages, temperature, maxTokens);
                break;
            case 'anthropic':
                content = await this._completeAnthropic(messages, temperature, maxTokens);
                break;
            case 'mock':
            default:
                content = await this._completeMock(messages);
                break;
        }
        logger.info({
            provider: this.provider,
            model: this.model,
            latencyMs: Date.now() - started,
        }, 'LLM completion');
        return { content, latencyMs: Date.now() - started, model: this.model };
    }
    async _completeOpenAI(messages, temperature, maxTokens) {
        const apiKey = env.OPENAI_API_KEY;
        if (!apiKey)
            throw new Error('OPENAI_API_KEY is not configured');
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages,
                temperature,
                max_tokens: maxTokens,
            }),
        });
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`OpenAI error ${res.status}: ${body}`);
        }
        const json = await res.json();
        return json.choices[0].message.content;
    }
    async _completeAnthropic(messages, temperature, maxTokens) {
        const apiKey = env.ANTHROPIC_API_KEY;
        if (!apiKey)
            throw new Error('ANTHROPIC_API_KEY is not configured');
        const system = messages
            .filter((m) => m.role === 'system')
            .map((m) => m.content)
            .join('\n');
        const rest = messages
            .filter((m) => m.role !== 'system')
            .map(({ role, content }) => ({ role, content }));
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: this.model,
                system,
                messages: rest,
                temperature,
                max_tokens: maxTokens,
            }),
        });
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`Anthropic error ${res.status}: ${body}`);
        }
        const json = await res.json();
        return json.content.map((block) => block.text).join('');
    }
    async _mockQuiz(system, userContent, kind = 'quiz') {
        const countMatch = /exactly\s+(\d+)\s+questions?/i.exec(system);
        const count = Math.min(30, Math.max(1, countMatch ? Number(countMatch[1]) : 10));
        const difficultyMatch = /(easy|medium|hard)/i.exec(system);
        const difficulty = difficultyMatch ? difficultyMatch[1].toLowerCase() : 'medium';
        const sourceTopic = (userContent.match(/topic[:\s]+([^\n.,;]+)/i)?.[1] || '').trim() || 'General';
        const questions = QUIZ_BANK.slice(0, count).map((q) => ({
            ...q,
            topic: q.topic,
            difficulty,
        }));
        const padded = count > QUIZ_BANK.length;
        if (padded) {
            let i = 0;
            while (questions.length < count) {
                const base = QUIZ_BANK[i % QUIZ_BANK.length];
                questions.push({
                    ...base,
                    question: `${base.question} (variant ${Math.floor(i / QUIZ_BANK.length) + 1})`,
                    difficulty,
                });
                i += 1;
            }
        }
        const title = sourceTopic !== 'General'
            ? `${sourceTopic} ${kind === 'exam' ? 'Exam' : 'Quiz'}`
            : `${difficulty} ${kind === 'exam' ? 'Exam' : 'Physiology Quiz'}`;
        return JSON.stringify({ title, questions });
    }
    async _completeMock(messages) {
        await sleep(300);
        const lastUser = [...messages].reverse().find((m) => m.role === 'user');
        const system = messages.find((m) => m.role === 'system')?.content || '';
        if (/quiz|generate.*question/i.test(system)) {
            return this._mockQuiz(system, lastUser?.content || '');
        }
        if (/exam paper|medical exam/i.test(system)) {
            return this._mockQuiz(system, lastUser?.content || '', 'exam');
        }
        if (/graph|knowledge map|concept map/i.test(system)) {
            return `
        {
          "title": "Cardiovascular Concepts",
          "nodes": [
            { "id": "heart", "label": "Heart", "explanation": "Muscular organ that pumps blood through the circulatory system. Its rhythmic contraction drives blood flow to tissues.", "page": 1, "importance": 5 },
            { "id": "cardiac_cycle", "label": "Cardiac Cycle", "explanation": "Sequence of electrical and mechanical events in one heartbeat: diastole (filling) and systole (ejection).", "page": 1, "importance": 5 },
            { "id": "stroke_volume", "label": "Stroke Volume", "explanation": "Volume of blood ejected by the left ventricle per beat, typically 60-100 mL. Determined by preload, afterload, and contractility.", "page": 1, "importance": 4 },
            { "id": "cardiac_output", "label": "Cardiac Output", "explanation": "Volume of blood pumped per minute, equal to heart rate multiplied by stroke volume (~5 L/min at rest).", "page": 1, "importance": 5 },
            { "id": "blood_pressure", "label": "Blood Pressure", "explanation": "Force exerted by blood on vessel walls; cardiac output times peripheral resistance.", "page": 1, "importance": 4 },
            { "id": "hypertension", "label": "Hypertension", "explanation": "Chronically elevated arterial blood pressure, a major risk factor for heart disease and stroke.", "page": 1, "importance": 4 },
            { "id": "baroreceptors", "label": "Baroreceptors", "explanation": "Pressure sensors in the carotid sinus and aortic arch that regulate blood pressure via reflex control.", "page": 1, "importance": 3 }
          ],
          "edges": [
            { "source": "heart", "target": "cardiac_cycle", "relation": "drives" },
            { "source": "cardiac_cycle", "target": "stroke_volume", "relation": "determines" },
            { "source": "stroke_volume", "target": "cardiac_output", "relation": "components" },
            { "source": "cardiac_output", "target": "blood_pressure", "relation": "increases" },
            { "source": "blood_pressure", "target": "hypertension", "relation": "when elevated leads to" },
            { "source": "baroreceptors", "target": "blood_pressure", "relation": "regulates" }
          ]
        }
      `;
        }
        if (/flashcard|study card/i.test(system)) {
            return `
        [
          { "front": "Cardiac output formula", "back": "CO = HR x SV" },
          { "front": "Normal resting heart rate", "back": "60-100 bpm" },
          { "front": "Frank-Starling law", "back": "Stroke volume increases with increased venous return" }
        ]
      `;
        }
        if (/summarize|summary/i.test(system)) {
            const prompt = lastUser?.content || '';
            return [
                `## Summary`,
                ``,
                `Based on the material provided (${truncate(prompt, 80)}...), this is a mock summary.`,
                ``,
                `- Key concept 1: connect the material back to core physiological principles.`,
                `- Key concept 2: identify clinical relevance and common exam questions.`,
                `- Key concept 3: note relationships with related systems.`,
            ].join('\n');
        }
        return [
            `This is a **mock AI response** (set AI_PROVIDER=openai or anthropic to enable a real model).`,
            ``,
            `You asked: ${truncate(lastUser?.content || '', 160)}`,
            ``,
            `**Sources:** Chunks were retrieved from the document and passed as context above.`,
        ].join('\n');
    }
}
function truncate(str, len) {
    return str.length > len ? `${str.slice(0, len)}…` : str;
}
const QUIZ_BANK = [
    {
        question: 'What is cardiac output?',
        options: ['Heart rate x Stroke volume', 'Blood pressure x Heart rate', 'Stroke volume / Heart rate', 'Cardiac index x Age'],
        correctIndex: 0,
        explanation: 'Cardiac output is the volume of blood pumped per minute, equal to heart rate multiplied by stroke volume.',
        topic: 'Cardiovascular',
    },
    {
        question: 'Which law governs the pressure-volume relationship of the left ventricle?',
        options: ["Boyle's law", 'Frank-Starling law', "Poiseuille's law", "Hooke's law"],
        correctIndex: 1,
        explanation: 'The Frank-Starling law describes how increased ventricular filling increases stroke volume.',
        topic: 'Cardiovascular',
    },
    {
        question: 'What is the normal resting heart rate for a healthy adult?',
        options: ['30-50 bpm', '60-100 bpm', '120-160 bpm', '150-180 bpm'],
        correctIndex: 1,
        explanation: 'Normal resting heart rate in adults is typically 60-100 beats per minute.',
        topic: 'Cardiovascular',
    },
    {
        question: 'Which blood vessels have the largest total cross-sectional area?',
        options: ['Aorta', 'Arterioles', 'Capillaries', 'Venules'],
        correctIndex: 2,
        explanation: 'Capillaries have the greatest total cross-sectional area, which slows blood flow and maximizes exchange.',
        topic: 'Cardiovascular',
    },
    {
        question: 'Which of the following is the pacemaker of the heart?',
        options: ['Atrioventricular node', 'Bundle of His', 'Sinoatrial node', 'Purkinje fibers'],
        correctIndex: 2,
        explanation: 'The sinoatrial node initiates the electrical impulse that drives the normal cardiac rhythm.',
        topic: 'Cardiovascular',
    },
    {
        question: 'Tidal volume in a healthy adult at rest is approximately:',
        options: ['150 mL', '500 mL', '1500 mL', '3000 mL'],
        correctIndex: 1,
        explanation: 'Tidal volume is about 500 mL per breath at rest.',
        topic: 'Respiratory',
    },
    {
        question: 'The primary muscle of respiration at rest is the:',
        options: ['External intercostals', 'Sternocleidomastoid', 'Diaphragm', 'Rectus abdominis'],
        correctIndex: 2,
        explanation: 'The diaphragm is the main inspiratory muscle, responsible for about 70% of resting ventilation.',
        topic: 'Respiratory',
    },
    {
        question: 'Which nerve innervates the diaphragm?',
        options: ['Vagus nerve', 'Phrenic nerve', 'Facial nerve', 'Accessory nerve'],
        correctIndex: 1,
        explanation: 'The phrenic nerve (C3-C5) supplies motor innervation to the diaphragm.',
        topic: 'Neuromuscular',
    },
    {
        question: 'Motor units follow which principle of recruitment?',
        options: ['Size principle', 'All-or-none principle', 'Bell-Magendie law', 'Frank-Starling law'],
        correctIndex: 0,
        explanation: 'According to the size principle, small motor units are recruited before larger ones as force demands increase.',
        topic: 'Neuromuscular',
    },
    {
        question: 'The neurotransmitter released at the neuromuscular junction is:',
        options: ['Dopamine', 'Serotonin', 'Acetylcholine', 'Norepinephrine'],
        correctIndex: 2,
        explanation: 'Acetylcholine is released by the motor neuron to trigger muscle fiber contraction.',
        topic: 'Neuromuscular',
    },
    {
        question: 'A lever where the fulcrum lies between effort and load is a:',
        options: ['First-class lever', 'Second-class lever', 'Third-class lever', 'Fourth-class lever'],
        correctIndex: 0,
        explanation: 'First-class levers have the fulcrum between the effort and the load, like the neck during head movement.',
        topic: 'Biomechanics',
    },
    {
        question: 'Which joint type allows the greatest range of motion?',
        options: ['Hinge joint', 'Ball-and-socket joint', 'Pivot joint', 'Condyloid joint'],
        correctIndex: 1,
        explanation: 'Ball-and-socket joints, such as the hip and shoulder, permit motion in multiple planes.',
        topic: 'Biomechanics',
    },
    {
        question: 'Concentric muscle contraction is defined as:',
        options: ['Muscle lengthening under load', 'Muscle shortening while producing tension', 'No change in muscle length', 'Relaxation of the muscle'],
        correctIndex: 1,
        explanation: 'A concentric contraction occurs when the muscle shortens while generating tension, e.g., lifting a weight.',
        topic: 'Muscle Physiology',
    },
    {
        question: 'Which energy system provides ATP fastest during a maximal 100m sprint?',
        options: ['Oxidative system', 'Glycolytic system', 'ATP-CP (phosphocreatine) system', 'Beta oxidation'],
        correctIndex: 2,
        explanation: 'The ATP-CP system regenerates ATP rapidly for short, high-intensity efforts lasting about 10 seconds.',
        topic: 'Exercise Physiology',
    },
    {
        question: 'The "all-or-none law" of muscle contraction refers to:',
        options: ['Whole muscle contractions are always maximal', 'A single muscle fiber fully contracts or not at all', 'Contractions only occur in whole muscle', 'Muscles always shorten completely'],
        correctIndex: 1,
        explanation: 'When a single muscle fiber is stimulated above threshold, it contracts fully; below threshold, it does not contract.',
        topic: 'Muscle Physiology',
    },
    {
        question: 'Which of the following is a closed-chain kinetic exercise?',
        options: ['Biceps curl with free weight', 'Seated knee extension', 'Squat', 'Leg extension machine'],
        correctIndex: 2,
        explanation: 'In closed-chain exercises like the squat, the distal segment is fixed, loading multiple joints and muscles.',
        topic: 'Therapeutic Exercise',
    },
    {
        question: 'What is the primary function of the sarcomere?',
        options: ['Storing calcium', 'Generating force through actin-myosin interaction', 'Producing ATP', 'Conducting nerve impulses'],
        correctIndex: 1,
        explanation: 'The sarcomere is the contractile unit of muscle; actin and myosin filaments slide to generate force.',
        topic: 'Muscle Physiology',
    },
    {
        question: 'Gait cycle stance phase makes up approximately what percentage of the cycle?',
        options: ['30%', '40%', '60%', '80%'],
        correctIndex: 2,
        explanation: 'The stance phase accounts for about 60% of the gait cycle; swing phase about 40%.',
        topic: 'Gait',
    },
    {
        question: 'Which ligament of the knee resists anterior translation of the tibia?',
        options: ['Posterior cruciate ligament', 'Anterior cruciate ligament', 'Medial collateral ligament', 'Lateral collateral ligament'],
        correctIndex: 1,
        explanation: 'The ACL prevents excessive anterior displacement of the tibia relative to the femur.',
        topic: 'Orthopaedics',
    },
    {
        question: 'Proprioception is primarily mediated by:',
        options: ['Photoreceptors', 'Muscle spindles and Golgi tendon organs', 'Nociceptors', 'Thermoreceptors'],
        correctIndex: 1,
        explanation: 'Muscle spindles and Golgi tendon organs detect muscle length and tension, contributing to joint position sense.',
        topic: 'Neurophysiology',
    },
    {
        question: 'The normal angle of the Q angle in the knee is approximately:',
        options: ['0-3 degrees', '10-15 degrees', '25-30 degrees', '45-50 degrees'],
        correctIndex: 1,
        explanation: 'The Q angle is typically 10-15 degrees in men and slightly larger in women.',
        topic: 'Orthopaedics',
    },
    {
        question: 'Which breathing pattern is characterized by progressively deeper breathing followed by apnea?',
        options: ['Cheyne-Stokes', 'Kussmaul', 'Biot', 'Apneustic'],
        correctIndex: 0,
        explanation: 'Cheyne-Stokes respiration is a crescendo-decrescendo pattern followed by a period of apnea.',
        topic: 'Respiratory',
    },
    {
        question: 'During muscle contraction, calcium binds to which protein on the thin filament?',
        options: ['Actin', 'Myosin', 'Troponin', 'Titin'],
        correctIndex: 2,
        explanation: 'Calcium binds to troponin C, causing a conformational change that exposes actin binding sites.',
        topic: 'Muscle Physiology',
    },
    {
        question: 'Postural sway during quiet standing is controlled primarily by:',
        options: ['Vestibular system only', 'Somatosensory, vestibular, and visual inputs', 'Visual system only', 'Cerebellum exclusively'],
        correctIndex: 1,
        explanation: 'Balance integrates somatosensory, vestibular, and visual information for postural control.',
        topic: 'Posture',
    },
    {
        question: 'Which modality is most appropriate for acute inflammation management?',
        options: ['Moist heat', 'Cryotherapy', 'Ultrasound', 'Traction'],
        correctIndex: 1,
        explanation: 'Cryotherapy reduces acute inflammation, pain, and swelling in the early phase of injury.',
        topic: 'Electrotherapy',
    },
    {
        question: 'The normal pH range of arterial blood is:',
        options: ['7.00-7.20', '7.35-7.45', '7.60-7.80', '6.80-7.00'],
        correctIndex: 1,
        explanation: 'Normal arterial pH is tightly regulated between 7.35 and 7.45.',
        topic: 'Physiology',
    },
    {
        question: 'Which spinal nerve root is most commonly affected in sciatica?',
        options: ['L2', 'C5', 'L4', 'S1'],
        correctIndex: 3,
        explanation: 'Sciatica most frequently involves the S1 nerve root caused by lumbar disc herniation.',
        topic: 'Orthopaedics',
    },
    {
        question: 'A patient with foot drop typically has weakness of which muscle group?',
        options: ['Gastrocnemius', 'Tibialis anterior', 'Quadriceps', 'Hamstrings'],
        correctIndex: 1,
        explanation: 'Tibialis anterior weakness causes foot drop and impaired ankle dorsiflexion.',
        topic: 'Neuromuscular',
    },
    {
        question: 'The predominant fiber type in the soleus muscle is:',
        options: ['Type IIa (fast oxidative)', 'Type IIx (fast glycolytic)', 'Type I (slow oxidative)', 'Type III'],
        correctIndex: 2,
        explanation: 'The soleus is predominantly type I slow-twitch fibers suited for postural endurance.',
        topic: 'Muscle Physiology',
    },
    {
        question: 'Which test best measures hamstring flexibility?',
        options: ['Sit-and-reach test', 'Thomas test', '90-90 test', 'Ely test'],
        correctIndex: 0,
        explanation: 'The sit-and-reach test assesses hamstring and lower back flexibility.',
        topic: 'Assessment',
    },
    {
        question: 'In a second-class lever, the load is located:',
        options: ['Between fulcrum and effort', 'Beyond the effort', 'At the fulcrum', 'Away from both fulcrum and effort'],
        correctIndex: 0,
        explanation: 'In a second-class lever the load lies between the fulcrum and the effort, favoring force production.',
        topic: 'Biomechanics',
    },
    {
        question: 'Which structure prevents posterior dislocation of the femur?',
        options: ['Iliofemoral ligament', 'Ischiofemoral ligament', 'Pubofemoral ligament', 'Ligamentum teres'],
        correctIndex: 0,
        explanation: 'The iliofemoral ligament is the strongest and limits posterior movement of the femoral head.',
        topic: 'Orthopaedics',
    },
];
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export const llm = new LLMService();
//# sourceMappingURL=llm.service.js.map