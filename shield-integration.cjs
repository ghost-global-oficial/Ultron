// Integração do S.H.I.E.L.D. (AI Security System) com o Ultron
// Sistema de 4 camadas para monitorar e proteger contra IAs maliciosas

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const EventEmitter = require('events');

class ShieldIntegration extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            enabled: config.enabled !== false,
            shieldPath: config.shieldPath || path.join(__dirname, 'shield'),
            pythonPath: config.pythonPath || 'python',
            ollamaEndpoint: config.ollamaEndpoint || 'http://localhost:11434',
            ollamaModel: config.ollamaModel || 'llama3.2:latest',
            autoBlock: config.autoBlock !== false,
            requireHumanApproval: config.requireHumanApproval !== false,
            logLevel: config.logLevel || 'INFO',
            ...config
        };
        
        this.shieldProcess = null;
        this.isRunning = false;
        this.actionQueue = [];
        this.pendingActions = new Map();
        this.metrics = {
            totalActions: 0,
            threatsDetected: 0,
            actionsBlocked: 0,
            agentsQuarantined: 0
        };
    }
    
    /**
     * Verifica se o S.H.I.E.L.D. está instalado e configurado
     */
    async checkInstallation() {
        const checks = {
            shieldExists: false,
            pythonAvailable: false,
            ollamaAvailable: false,
            dependenciesInstalled: false
        };
        
        // Verificar se o diretório shield existe
        checks.shieldExists = fs.existsSync(this.config.shieldPath);
        
        // Verificar Python
        try {
            const { execSync } = require('child_process');
            const pythonVersion = execSync(`${this.config.pythonPath} --version`, { encoding: 'utf8' });
            checks.pythonAvailable = pythonVersion.includes('Python 3.');
        } catch (error) {
            checks.pythonAvailable = false;
        }
        
        // Verificar Ollama
        try {
            const response = await fetch(`${this.config.ollamaEndpoint}/api/tags`);
            checks.ollamaAvailable = response.ok;
        } catch (error) {
            checks.ollamaAvailable = false;
        }
        
        // Verificar dependências Python
        const requirementsPath = path.join(this.config.shieldPath, 'requirements.txt');
        checks.dependenciesInstalled = fs.existsSync(requirementsPath);
        
        return checks;
    }
    
    /**
     * Instala o S.H.I.E.L.D. e suas dependências
     */
    async install() {
        console.log('🛡️ Instalando S.H.I.E.L.D...');
        
        const checks = await this.checkInstallation();
        
        if (!checks.shieldExists) {
            throw new Error('Diretório shield não encontrado. Execute: git clone https://github.com/ghost-global-oficial/AI-Security-S.H.I.E.L.D..git shield');
        }
        
        if (!checks.pythonAvailable) {
            throw new Error('Python 3.8+ não encontrado. Instale Python primeiro.');
        }
        
        // Instalar dependências Python
        console.log('📦 Instalando dependências Python...');
        const { execSync } = require('child_process');
        
        try {
            execSync(`${this.config.pythonPath} -m pip install -r requirements.txt`, {
                cwd: this.config.shieldPath,
                stdio: 'inherit'
            });
            console.log('✓ Dependências instaladas');
        } catch (error) {
            throw new Error('Erro ao instalar dependências: ' + error.message);
        }
        
        // Verificar Ollama
        if (!checks.ollamaAvailable) {
            console.warn('⚠️ Ollama não está rodando. O Oracle Layer não funcionará.');
            console.warn('   Instale Ollama: https://ollama.ai/');
            console.warn('   Inicie: ollama serve');
            console.warn('   Baixe modelo: ollama pull ' + this.config.ollamaModel);
        }
        
        // Criar arquivo de configuração
        await this.createConfig();
        
        console.log('✓ S.H.I.E.L.D. instalado com sucesso!');
        return true;
    }
    
    /**
     * Cria arquivo de configuração do S.H.I.E.L.D.
     */
    async createConfig() {
        const configPath = path.join(this.config.shieldPath, 'config.json');
        
        const shieldConfig = {
            perimeter: {
                max_api_calls_per_minute: 100,
                max_memory_mb: 1024,
                max_cpu_percent: 80,
                allowed_domains: [
                    'api.openai.com',
                    'api.anthropic.com',
                    'openrouter.ai',
                    'api.x.ai',
                    'generativelanguage.googleapis.com'
                ],
                blocked_domains: [],
                enable_network_monitoring: true,
                enable_resource_monitoring: true
            },
            heuristics: {
                anomaly_threshold: 0.7,
                pattern_window_size: 100,
                learning_rate: 0.01,
                enable_adaptive_learning: true
            },
            oracle: {
                llm_model: this.config.ollamaModel,
                llm_endpoint: this.config.ollamaEndpoint,
                analysis_timeout: 30,
                min_confidence: 0.6,
                enable_chain_of_thought: true
            },
            enforcement: {
                auto_block_threshold: 3,
                auto_kill_threshold: 4,
                require_human_approval: this.config.requireHumanApproval,
                quarantine_duration_seconds: 3600
            },
            logging: {
                level: this.config.logLevel,
                file: 'logs/shield.log'
            }
        };
        
        fs.writeFileSync(configPath, JSON.stringify(shieldConfig, null, 2));
        console.log('✓ Configuração criada:', configPath);
    }
    
    /**
     * Inicia o S.H.I.E.L.D.
     */
    async start() {
        if (!this.config.enabled) {
            console.log('⚠️ S.H.I.E.L.D. desabilitado na configuração');
            return false;
        }
        
        if (this.isRunning) {
            console.log('⚠️ S.H.I.E.L.D. já está rodando');
            return true;
        }
        
        console.log('🛡️ Iniciando S.H.I.E.L.D...');
        
        // Verificar instalação
        const checks = await this.checkInstallation();
        if (!checks.shieldExists || !checks.pythonAvailable) {
            throw new Error('S.H.I.E.L.D. não está instalado. Execute shield.install() primeiro.');
        }
        
        // Criar script Python para rodar o S.H.I.E.L.D. como serviço
        const serverScript = this.createServerScript();
        const serverPath = path.join(this.config.shieldPath, 'shield_server.py');
        fs.writeFileSync(serverPath, serverScript);
        
        // Iniciar processo Python
        this.shieldProcess = spawn(this.config.pythonPath, [serverPath], {
            cwd: this.config.shieldPath,
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        this.shieldProcess.stdout.on('data', (data) => {
            const message = data.toString().trim();
            console.log('[S.H.I.E.L.D.]', message);
            this.emit('log', message);
            
            // Processar respostas
            this.processShieldOutput(message);
        });
        
        this.shieldProcess.stderr.on('data', (data) => {
            const error = data.toString().trim();
            console.error('[S.H.I.E.L.D. ERROR]', error);
            this.emit('error', error);
        });
        
        this.shieldProcess.on('exit', (code) => {
            console.log(`[S.H.I.E.L.D.] Processo encerrado com código ${code}`);
            this.isRunning = false;
            this.emit('stopped', code);
        });
        
        this.isRunning = true;
        this.emit('started');
        
        console.log('✓ S.H.I.E.L.D. iniciado');
        return true;
    }
    
    /**
     * Para o S.H.I.E.L.D.
     */
    async stop() {
        if (!this.isRunning || !this.shieldProcess) {
            return;
        }
        
        console.log('🛡️ Parando S.H.I.E.L.D...');
        
        this.shieldProcess.kill('SIGTERM');
        
        // Aguardar até 5 segundos
        await new Promise((resolve) => {
            const timeout = setTimeout(() => {
                if (this.shieldProcess) {
                    this.shieldProcess.kill('SIGKILL');
                }
                resolve();
            }, 5000);
            
            this.shieldProcess.once('exit', () => {
                clearTimeout(timeout);
                resolve();
            });
        });
        
        this.isRunning = false;
        console.log('✓ S.H.I.E.L.D. parado');
    }
    
    /**
     * Monitora uma ação da IA
     */
    async monitorAction(action) {
        if (!this.config.enabled || !this.isRunning) {
            return { allowed: true, reason: 'S.H.I.E.L.D. desabilitado' };
        }
        
        const actionId = `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const shieldAction = {
            action_id: actionId,
            timestamp: Date.now() / 1000,
            action_type: action.type || 'UNKNOWN',
            description: action.description || '',
            parameters: action.parameters || {},
            agent_id: action.agentId || 'ultron-agent',
            reasoning: action.reasoning || ''
        };
        
        // Enviar para S.H.I.E.L.D.
        return new Promise((resolve) => {
            this.pendingActions.set(actionId, resolve);
            
            const command = JSON.stringify({
                command: 'monitor_action',
                data: shieldAction
            }) + '\n';
            
            this.shieldProcess.stdin.write(command);
            
            // Timeout de 30 segundos
            setTimeout(() => {
                if (this.pendingActions.has(actionId)) {
                    this.pendingActions.delete(actionId);
                    resolve({ allowed: true, reason: 'Timeout - permitido por padrão' });
                }
            }, 30000);
        });
    }
    
    /**
     * Processa saída do S.H.I.E.L.D.
     */
    processShieldOutput(message) {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'assessment') {
                const actionId = data.action_id;
                const resolve = this.pendingActions.get(actionId);
                
                if (resolve) {
                    this.pendingActions.delete(actionId);
                    
                    const result = {
                        allowed: data.allowed,
                        threatLevel: data.threat_level,
                        reason: data.reason,
                        confidence: data.confidence,
                        layers: data.layers
                    };
                    
                    // Atualizar métricas
                    this.metrics.totalActions++;
                    if (!data.allowed) {
                        this.metrics.actionsBlocked++;
                    }
                    if (data.threat_level >= 3) {
                        this.metrics.threatsDetected++;
                    }
                    
                    // Emitir evento
                    this.emit('assessment', result);
                    
                    resolve(result);
                }
            } else if (data.type === 'metrics') {
                this.metrics = { ...this.metrics, ...data.data };
                this.emit('metrics', this.metrics);
            }
        } catch (error) {
            // Não é JSON, ignorar
        }
    }
    
    /**
     * Cria script Python do servidor S.H.I.E.L.D.
     */
    createServerScript() {
        return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
S.H.I.E.L.D. Server - Interface JSON para Node.js
"""

import sys
import json
import time
from shield_core import SHIELDCore, AIAction, ActionType
from layer_perimeter import PerimeterDefense
from layer_heuristics import HeuristicAnalyzer
from layer_oracle import OracleAnalyzer

def main():
    # Carregar configuração
    try:
        with open('config.json') as f:
            config = json.load(f)
    except:
        config = {}
    
    # Inicializar S.H.I.E.L.D.
    shield = SHIELDCore(config.get('enforcement', {}))
    
    # Adicionar camadas
    try:
        perimeter = PerimeterDefense(config.get('perimeter', {}))
        shield.add_layer_callback('perimeter', perimeter.analyze)
    except Exception as e:
        print(json.dumps({'type': 'error', 'message': f'Perimeter layer failed: {e}'}), flush=True)
    
    try:
        heuristics = HeuristicAnalyzer(config.get('heuristics', {}))
        shield.add_layer_callback('heuristics', heuristics.analyze)
    except Exception as e:
        print(json.dumps({'type': 'error', 'message': f'Heuristics layer failed: {e}'}), flush=True)
    
    try:
        oracle = OracleAnalyzer(config.get('oracle', {}))
        shield.add_layer_callback('oracle', oracle.analyze)
    except Exception as e:
        print(json.dumps({'type': 'error', 'message': f'Oracle layer failed: {e}'}), flush=True)
    
    shield.start()
    
    print(json.dumps({'type': 'ready', 'message': 'S.H.I.E.L.D. ready'}), flush=True)
    
    # Loop de processamento
    for line in sys.stdin:
        try:
            command = json.load(line.strip())
            
            if command['command'] == 'monitor_action':
                data = command['data']
                
                # Criar ação
                action = AIAction(
                    action_id=data['action_id'],
                    timestamp=data['timestamp'],
                    action_type=getattr(ActionType, data['action_type'], ActionType.UNKNOWN),
                    description=data['description'],
                    parameters=data['parameters'],
                    agent_id=data['agent_id'],
                    reasoning=data.get('reasoning', '')
                )
                
                # Processar
                assessment = shield.process_action(action)
                allowed = shield.enforce_action(assessment)
                
                # Responder
                response = {
                    'type': 'assessment',
                    'action_id': data['action_id'],
                    'allowed': allowed,
                    'threat_level': assessment.threat_level.value,
                    'reason': assessment.reason,
                    'confidence': assessment.confidence,
                    'layers': {
                        layer: result.to_dict() 
                        for layer, result in assessment.layer_results.items()
                    }
                }
                
                print(json.dumps(response), flush=True)
                
            elif command['command'] == 'get_metrics':
                metrics = shield.get_metrics()
                response = {
                    'type': 'metrics',
                    'data': metrics
                }
                print(json.dumps(response), flush=True)
                
        except Exception as e:
            error_response = {
                'type': 'error',
                'message': str(e)
            }
            print(json.dumps(error_response), flush=True)

if __name__ == '__main__':
    main()
`;
    }
    
    /**
     * Obtém métricas do S.H.I.E.L.D.
     */
    async getMetrics() {
        if (!this.isRunning) {
            return this.metrics;
        }
        
        return new Promise((resolve) => {
            const command = JSON.stringify({ command: 'get_metrics' }) + '\n';
            this.shieldProcess.stdin.write(command);
            
            // Aguardar resposta ou timeout
            const timeout = setTimeout(() => {
                resolve(this.metrics);
            }, 5000);
            
            const handler = (metrics) => {
                clearTimeout(timeout);
                this.removeListener('metrics', handler);
                resolve(metrics);
            };
            
            this.once('metrics', handler);
        });
    }
    
    /**
     * Obtém status do S.H.I.E.L.D.
     */
    getStatus() {
        return {
            enabled: this.config.enabled,
            running: this.isRunning,
            metrics: this.metrics
        };
    }
}

module.exports = ShieldIntegration;
