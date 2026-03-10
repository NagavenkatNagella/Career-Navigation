import type { CareerPathType, AssessmentQuestion, RoadmapStep } from "../types";

export const CAREER_PATHS: Record<CareerPathType, { label: string, description: string }> = {
    'software-dev': {
        label: 'Software Development',
        description: 'Build robust applications and systems using modern frameworks.'
    },
    'data-science': {
        label: 'Data Science',
        description: 'Extract insights from data using statistical and analytical tools.'
    },
    'cybersecurity': {
        label: 'Cybersecurity',
        description: 'Protect systems and networks from digital attacks.'
    },
    'ai-ml': {
        label: 'Artificial Intelligence',
        description: 'Create intelligent systems that learn and adapt.'
    },
    'cloud-eng': {
        label: 'Cloud Computing',
        description: 'Manage and scale infrastructure in the cloud.'
    },
    'ui-ux': {
        label: 'UI/UX Design',
        description: 'Design intuitive and beautiful user interfaces and experiences.'
    }
};

export const QUESTIONS_BY_PATH: Record<CareerPathType, AssessmentQuestion[]> = {
    'software-dev': [
        { id: 1, question: "What is the purpose of 'git merge'?", options: ["Create a new branch", "Combine changes from different branches", "Delete a branch", "Undo recent commits"], correctAnswer: 1, skillMapped: "Git/Tools" },
        { id: 2, question: "Which data structure uses LIFO (Last-In-First-Out)?", options: ["Queue", "Linked List", "Stack", "Tree"], correctAnswer: 2, skillMapped: "Data Structures" },
        { id: 3, question: "What does REST stand for in web services?", options: ["Representational State Transfer", "Relational System Transit", "Responsive State Timing", "Regular State Tracking"], correctAnswer: 0, skillMapped: "Backend API" }
    ],
    'data-science': [
        { id: 1, question: "Which library is most common for data manipulation in Python?", options: ["Flask", "Pandas", "PyQt", "Selenium"], correctAnswer: 1, skillMapped: "Python/Libraries" },
        { id: 2, question: "What is a 'p-value' in statistics?", options: ["Probability of error", "Parameter value", "Percentage of data", "Polynomial value"], correctAnswer: 0, skillMapped: "Statistics" },
        { id: 3, question: "What is supervised learning used for?", options: ["Clustering", "Classification and Regression", "Association rules", "Data cleaning"], correctAnswer: 1, skillMapped: "Machine Learning" }
    ],
    'cybersecurity': [
        { id: 1, question: "What does 'SQL Injection' target?", options: ["User passwords", "Database layer", "Browser cache", "Operating system"], correctAnswer: 1, skillMapped: "Web Security" },
        { id: 2, question: "What is the role of a Firewall?", options: ["Storage", "Processing", "Filtering network traffic", "Encrypting files"], correctAnswer: 2, skillMapped: "Network Security" },
        { id: 3, question: "What is 'Phishing'?", options: ["Data backup", "Social engineering attack", "Hardware failure", "Network expansion"], correctAnswer: 1, skillMapped: "Human Risk" }
    ],
    'ai-ml': [
        { id: 1, question: "What is Backpropagation?", options: ["Data loading", "Optimizing neural network weights", "System backup", "Feature engineering"], correctAnswer: 1, skillMapped: "Neural Networks" },
        { id: 2, question: "What is Overfitting?", options: ["Model matches training data too closely", "Model is too simple", "Dataset is too small", "Training is too fast"], correctAnswer: 0, skillMapped: "Model Performance" },
        { id: 3, question: "What is a 'Tensor'?", options: ["Multi-dimensional array", "Encryption key", "Hardware component", "Code editor"], correctAnswer: 0, skillMapped: "Deep Learning" }
    ],
    'cloud-eng': [
        { id: 1, question: "What is 'SaaS'?", options: ["Servers as a Service", "Software as a Service", "System as a Service", "Security as a Service"], correctAnswer: 1, skillMapped: "Cloud Models" },
        { id: 2, question: "Which service is used for auto-scaling on AWS?", options: ["S3", "EC2 Auto Scaling", "Lambda", "IAM"], correctAnswer: 1, skillMapped: "Infrastructure" },
        { id: 3, question: "What is the primary benefit of Serverless computing?", options: ["Fixed costs", "No hardware management", "Slower performance", "Manual scaling"], correctAnswer: 1, skillMapped: "Modern Architectures" }
    ],
    'ui-ux': [
        { id: 1, question: "What does UX stand for?", options: ["User Experience", "User Extreme", "Unit Exchange", "User Exercise"], correctAnswer: 0, skillMapped: "Basics" },
        { id: 2, question: "What is a 'Wireframe'?", options: ["A finished design", "A low-fidelity blueprint", "A physical frame", "A coding framework"], correctAnswer: 1, skillMapped: "Design" },
        { id: 3, question: "Which color model is primarily used for digital screens?", options: ["CMYK", "RGB", "PMS", "RYB"], correctAnswer: 1, skillMapped: "Color Theory" }
    ]
};

export const ROADMAPS: Record<CareerPathType, RoadmapStep[]> = {
    'software-dev': [
        { title: "Fundamentals", description: "Algorithm basics and HTML/CSS/JS", status: "completed", technologies: ["Logic", "Basic Frontend"] },
        { title: "Adv. Programming", description: "Mastering React and Data Structures", status: "current", technologies: ["React", "TypeScript", "DS&A"] },
        { title: "System Design", description: "Scalability and Architecture", status: "locked", technologies: ["Distributed Systems", "Scaling"] }
    ],
    'data-science': [
        { title: "Math & Stats", description: "Probability and Linear Algebra", status: "completed", technologies: ["Calculus", "Probability"] },
        { title: "Analysis Tools", description: "Python for Data Analysis", status: "current", technologies: ["Pandas", "Matplotlib", "SQL"] },
        { title: "Predictive Models", description: "Applied Machine Learning", status: "locked", technologies: ["Scikit-Learn", "Deep Learning"] }
    ],
    'cybersecurity': [
        { title: "Networking", description: "TCP/IP and OS fundamentals", status: "completed", technologies: ["Linux", "Protocols"] },
        { title: "Security Ops", description: "Threat detection and firewalls", status: "current", technologies: ["SIEM", "Pentesting"] },
        { title: "Governance", description: "Risk Management and Compliance", status: "locked", technologies: ["ISO 27001", "GDPR"] }
    ],
    'ai-ml': [
        { title: "Python/Math", description: "Python and Matrix Algebra", status: "completed", technologies: ["NumPy", "Linear Algebra"] },
        { title: "Core ML", description: "Regression and SVMs", status: "current", technologies: ["Supervised ML", "Feature Eng."] },
        { title: "Neural Networks", description: "Deep Learning and Transformers", status: "locked", technologies: ["PyTorch", "LLMs"] }
    ],
    'cloud-eng': [
        { title: "IT Foundations", description: "Virtualization and OS basics", status: "completed", technologies: ["Ubuntu", "Docker"] },
        { title: "Cloud Platforms", description: "AWS/Azure/GCP Essentials", status: "current", technologies: ["IAM", "VPC", "EC2"] },
        { title: "DevOps/SRE", description: "CI/CD and Infrastructure as Code", status: "locked", technologies: ["Terraform", "Kubernetes"] }
    ],
    'ui-ux': [
        { title: "Design Principles", description: "Typography, Color, and Layout", status: "completed", technologies: ["Visual Hierarchy", "Color Wheel"] },
        { title: "Tools & Prototyping", description: "Mastering Figma and Auto Layout", status: "current", technologies: ["Figma", "Prototypes"] },
        { title: "User Research", description: "Personas and User Testing", status: "locked", technologies: ["Interviews", "Usability Testing"] }
    ]
};

export const INDUSTRY_TRENDS = [
    { name: 'Generative AI', growth: '+240%', demand: 98 },
    { name: 'Cloud Security', growth: '+85%', demand: 92 },
    { name: 'Full-Stack Dev', growth: '+45%', demand: 88 },
    { name: 'LLM Engineering', growth: '+310%', demand: 95 },
    { name: 'Edge Computing', growth: '+30%', demand: 75 }
];
