// Sistema de Internacionalização (i18n) do Ultron

const translations = {
    'pt-BR': {
        // Welcome Screen
        'welcome.title': 'Bem-vindo ao Ultron Gateway Setup',
        'welcome.description1': 'Este assistente irá guiá-lo através da configuração inicial do seu Gateway ULTRON.',
        'welcome.description2': 'O Gateway é o coração do Ultron, conectando seus canais de mensagens aos modelos de IA.',
        'welcome.autoConfig': '✓ Configurações Automáticas:',
        'welcome.mode': 'Modo: Local (nesta máquina)',
        'welcome.port': 'Porta: 18789 (padrão)',
        'welcome.auth': 'Autenticação: Token (gerado automaticamente)',
        'welcome.startButton': 'Iniciar Configuração →',
        
        // Language Selection
        'language.title': 'Escolha o Idioma',
        'language.description': 'Selecione o idioma da interface:',
        'language.portuguese': 'Português (Brasil)',
        'language.english': 'English (United States)',
        'language.spanish': 'Español',
        'language.french': 'Français',
        'language.german': 'Deutsch',
        'language.continue': 'Continuar →',
        
        // Execution Mode
        'execution.title': 'Modo de Execução',
        'execution.description': 'Escolha onde a IA executará comandos e ferramentas:',
        'execution.host.title': 'Host (PC do Usuário)',
        'execution.host.description': 'A IA executa comandos diretamente no seu computador. Mais rápido, mas menos seguro.',
        'execution.sandbox.title': 'Sandbox (Docker)',
        'execution.sandbox.description': 'A IA executa comandos em um ambiente isolado. Mais seguro, mas requer Docker.',
        'execution.continue': 'Continuar →',
        
        // Network Configuration
        'network.title': 'Configuração de Rede',
        'network.description': 'Configure o endereço IP onde o Gateway irá escutar:',
        'network.loopback': 'Loopback (127.0.0.1)',
        'network.loopbackDesc': 'Apenas conexões locais (mais seguro)',
        'network.lan': 'LAN',
        'network.lanDesc': 'Permite conexões da rede local',
        'network.auto': 'Auto (0.0.0.0)',
        'network.autoDesc': 'Aceita conexões de qualquer rede',
        'network.continue': 'Continuar →',
        
        // Provider Selection
        'provider.title': 'Escolha o Provedor de IA',
        'provider.description': 'Selecione qual provedor de modelos de IA você deseja usar:',
        'provider.google': 'Google',
        'provider.googleDesc': 'Gemini 2.0, Gemini 1.5 Pro/Flash',
        'provider.claude': 'Claude (Anthropic)',
        'provider.claudeDesc': 'Claude Opus 4.5, Sonnet 4, 3.5 Sonnet',
        'provider.openrouter': 'OpenRouter',
        'provider.openrouterDesc': 'Acesso a múltiplos modelos via API unificada',
        'provider.grok': 'Grok (xAI)',
        'provider.grokDesc': 'Grok Beta, Grok Vision Beta',
        'provider.openai': 'OpenAI',
        'provider.openaiDesc': 'GPT-4 Turbo, GPT-4, GPT-3.5 Turbo',
        'provider.local': 'Modelos Locais',
        'provider.localDesc': 'Ollama - Execute modelos localmente no seu computador',
        'provider.continue': 'Continuar →',
        'provider.back': '← Voltar',
        
        // API Key
        'apikey.title': 'Chave API do',
        'apikey.howto': 'Como obter sua chave API:',
        'apikey.step1': 'Acesse:',
        'apikey.step2': 'Faça login ou crie uma conta',
        'apikey.step3': 'Gere uma nova chave API',
        'apikey.step4': 'Cole a chave no campo abaixo',
        'apikey.label': 'Chave API:',
        'apikey.secure': 'Sua chave será armazenada de forma segura localmente',
        'apikey.continue': 'Continuar →',
        'apikey.back': '← Voltar',
        
        // Model Selection
        'model.title': 'Escolha o Modelo de IA',
        'model.description': 'Selecione qual modelo do',
        'model.youWantToUse': 'você deseja usar:',
        'model.finish': '✅ Finalizar e Iniciar Gateway',
        'model.back': '← Voltar',
        
        // API Test
        'apitest.title': 'Teste de Conexão API',
        'apitest.validating': 'Validando sua chave API...',
        'apitest.provider': 'Provedor:',
        'apitest.model': 'Modelo:',
        'apitest.testing': 'Testando conexão com o provedor...',
        'apitest.success': '✓ CONEXÃO ESTABELECIDA COM SUCESSO!',
        'apitest.successDesc': 'Chave API válida e funcional.',
        'apitest.modelInfo': 'Modelo:',
        'apitest.failed': '✗ FALHA NA CONEXÃO',
        'apitest.error': 'Erro:',
        'apitest.errorDesc': 'Verifique sua chave API e tente novamente.',
        'apitest.retry': '← Voltar e Corrigir',
        'apitest.skip': 'Pular Teste',
        'apitest.continue': 'Continuar →',
        
        // Starting
        'starting.completed': '✅ Configuração Concluída!',
        'starting.success': 'O Gateway Ultron foi configurado com sucesso.',
        'starting.mode': 'Modo:',
        'starting.port': 'Porta:',
        'starting.ip': 'IP:',
        'starting.auth': 'Auth:',
        'starting.provider': 'Provedor:',
        'starting.model': 'Modelo:',
        'starting.title': 'Iniciando Gateway...',
        'starting.initializing': 'Gateway em inicialização',
        'starting.token': 'Token:',
        'starting.info': 'Informação:',
        'starting.configSaved': 'Configuração salva em:',
        'starting.verified': 'Gateway verificado e funcionando!',
        'starting.url': 'URL:',
        'starting.tokenTitle': 'Token do Gateway',
        'starting.tokenDesc': 'Copie este token agora! Você precisará dele para conectar o chat ao gateway.',
        'starting.copy': 'Copiar',
        'starting.tokenSaved': 'O token também foi salvo em:',
        'starting.openChat': 'Abrir Chat',
        'starting.error': 'Erro ao iniciar Gateway:',
        'starting.details': 'Ver detalhes',
        'starting.retry': 'Tentar Novamente',
        
        // Additional Info (Vault)
        'vault.title': 'Cofre de Informações (Opcional)',
        'vault.description': 'Armazene informações sensíveis de forma segura. Todos os dados são criptografados localmente.',
        'vault.passwords': 'Senhas',
        'vault.passwordsDesc': 'Senhas de serviços, contas, etc.',
        'vault.creditCards': 'Cartões de Crédito',
        'vault.creditCardsDesc': 'Números de cartão, CVV, validade',
        'vault.apiKeys': 'Chaves de API',
        'vault.apiKeysDesc': 'Chaves de outras IAs e serviços',
        'vault.notes': 'Notas Seguras',
        'vault.notesDesc': 'Outras informações confidenciais',
        'vault.aiRules': 'Regras para IA',
        'vault.aiRulesDesc': 'Prompts do sistema, instruções personalizadas',
        'vault.addPassword': '+ Adicionar Senha',
        'vault.addCard': '+ Adicionar Cartão',
        'vault.addApiKey': '+ Adicionar Chave API',
        'vault.addNote': '+ Adicionar Nota',
        'vault.addAiRule': '+ Adicionar Regra',
        'vault.serviceName': 'Nome do Serviço',
        'vault.username': 'Usuário/Email',
        'vault.password': 'Senha',
        'vault.cardNumber': 'Número do Cartão',
        'vault.cardHolder': 'Nome no Cartão',
        'vault.expiryDate': 'Validade (MM/AA)',
        'vault.cvv': 'CVV',
        'vault.apiKeyName': 'Nome da API',
        'vault.apiKeyValue': 'Chave API',
        'vault.noteTitle': 'Título',
        'vault.noteContent': 'Conteúdo',
        'vault.ruleTitle': 'Nome da Regra',
        'vault.ruleContent': 'Instruções para a IA',
        'vault.ruleActive': 'Ativar esta regra',
        'vault.save': 'Salvar',
        'vault.cancel': 'Cancelar',
        'vault.delete': 'Deletar',
        'vault.edit': 'Editar',
        'vault.show': 'Mostrar',
        'vault.hide': 'Ocultar',
        'vault.copy': 'Copiar',
        'vault.copied': 'Copiado!',
        'vault.skip': 'Pular (Configurar Depois)',
        'vault.continue': 'Continuar',
        'vault.back': 'Voltar',
        'vault.encrypted': 'Criptografado',
        'vault.noItems': 'Nenhum item adicionado ainda',
        'vault.confirmDelete': 'Tem certeza que deseja deletar este item?',
        
        // Status Messages
        'status.tokenGenerated': 'Token gerado automaticamente',
        'status.configSaved': 'Configuração salva com sucesso!',
        'status.apiConfigured': 'Chave API configurada',
        'status.savingConfig': 'Salvando configuração...',
        'status.startingGateway': 'Iniciando Gateway...',
        'status.loadingChat': 'Carregando interface de chat...',
        'status.ready': 'Pronto para configurar',
        
        // Errors
        'error.critical': 'ERRO CRÍTICO: Modelo incompatível com provedor!',
        'error.configNotSaved': 'Configuração NÃO foi salva.',
        'error.invalidModel': 'O modelo não pertence ao provedor',
        'error.selectValid': 'Por favor, selecione um modelo válido.',
        
        // Common
        'common.local': 'Local',
        'common.token': 'Token',
        'common.copied': '✅ Copiado!'
    },
    
    'en-US': {
        // Welcome Screen
        'welcome.title': 'Welcome to Ultron Gateway Setup',
        'welcome.description1': 'This wizard will guide you through the initial setup of your ULTRON Gateway.',
        'welcome.description2': 'The Gateway is the heart of Ultron, connecting your messaging channels to AI models.',
        'welcome.autoConfig': '✓ Automatic Settings:',
        'welcome.mode': 'Mode: Local (this machine)',
        'welcome.port': 'Port: 18789 (default)',
        'welcome.auth': 'Authentication: Token (auto-generated)',
        'welcome.startButton': 'Start Configuration →',
        
        // Language Selection
        'language.title': 'Choose Language',
        'language.description': 'Select the interface language:',
        'language.portuguese': 'Português (Brasil)',
        'language.english': 'English (United States)',
        'language.spanish': 'Español',
        'language.french': 'Français',
        'language.german': 'Deutsch',
        'language.continue': 'Continue →',
        
        // Execution Mode
        'execution.title': 'Execution Mode',
        'execution.description': 'Choose where the AI will execute commands and tools:',
        'execution.host.title': 'Host (User PC)',
        'execution.host.description': 'AI executes commands directly on your computer. Faster, but less secure.',
        'execution.sandbox.title': 'Sandbox (Docker)',
        'execution.sandbox.description': 'AI executes commands in an isolated environment. More secure, but requires Docker.',
        'execution.continue': 'Continue →',
        
        // Network Configuration
        'network.title': 'Network Configuration',
        'network.description': 'Configure the IP address where the Gateway will listen:',
        'network.loopback': 'Loopback (127.0.0.1)',
        'network.loopbackDesc': 'Local connections only (more secure)',
        'network.lan': 'LAN',
        'network.lanDesc': 'Allows local network connections',
        'network.auto': 'Auto (0.0.0.0)',
        'network.autoDesc': 'Accepts connections from any network',
        'network.continue': 'Continue →',
        
        // Provider Selection
        'provider.title': 'Choose AI Provider',
        'provider.description': 'Select which AI model provider you want to use:',
        'provider.google': 'Google',
        'provider.googleDesc': 'Gemini 2.0, Gemini 1.5 Pro/Flash',
        'provider.claude': 'Claude (Anthropic)',
        'provider.claudeDesc': 'Claude Opus 4.5, Sonnet 4, 3.5 Sonnet',
        'provider.openrouter': 'OpenRouter',
        'provider.openrouterDesc': 'Access to multiple models via unified API',
        'provider.grok': 'Grok (xAI)',
        'provider.grokDesc': 'Grok Beta, Grok Vision Beta',
        'provider.openai': 'OpenAI',
        'provider.openaiDesc': 'GPT-4 Turbo, GPT-4, GPT-3.5 Turbo',
        'provider.local': 'Local Models',
        'provider.localDesc': 'Ollama - Run models locally on your computer',
        'provider.continue': 'Continue →',
        'provider.back': '← Back',
        
        // API Key
        'apikey.title': 'API Key for',
        'apikey.howto': 'How to get your API key:',
        'apikey.step1': 'Visit:',
        'apikey.step2': 'Login or create an account',
        'apikey.step3': 'Generate a new API key',
        'apikey.step4': 'Paste the key in the field below',
        'apikey.label': 'API Key:',
        'apikey.secure': 'Your key will be stored securely locally',
        'apikey.continue': 'Continue →',
        'apikey.back': '← Back',
        
        // Model Selection
        'model.title': 'Choose AI Model',
        'model.description': 'Select which model from',
        'model.youWantToUse': 'you want to use:',
        'model.finish': '✅ Finish and Start Gateway',
        'model.back': '← Back',
        
        // API Test
        'apitest.title': 'API Connection Test',
        'apitest.validating': 'Validating your API key...',
        'apitest.provider': 'Provider:',
        'apitest.model': 'Model:',
        'apitest.testing': 'Testing connection with provider...',
        'apitest.success': '✓ CONNECTION ESTABLISHED SUCCESSFULLY!',
        'apitest.successDesc': 'Valid and functional API key.',
        'apitest.modelInfo': 'Model:',
        'apitest.failed': '✗ CONNECTION FAILED',
        'apitest.error': 'Error:',
        'apitest.errorDesc': 'Check your API key and try again.',
        'apitest.retry': '← Back and Fix',
        'apitest.skip': 'Skip Test',
        'apitest.continue': 'Continue →',
        
        // Starting
        'starting.completed': '✅ Configuration Completed!',
        'starting.success': 'Ultron Gateway has been configured successfully.',
        'starting.mode': 'Mode:',
        'starting.port': 'Port:',
        'starting.ip': 'IP:',
        'starting.auth': 'Auth:',
        'starting.provider': 'Provider:',
        'starting.model': 'Model:',
        'starting.title': 'Starting Gateway...',
        'starting.initializing': 'Gateway initializing',
        'starting.token': 'Token:',
        'starting.info': 'Information:',
        'starting.configSaved': 'Configuration saved at:',
        'starting.verified': 'Gateway verified and working!',
        'starting.url': 'URL:',
        'starting.tokenTitle': 'Gateway Token',
        'starting.tokenDesc': 'Copy this token now! You will need it to connect the chat to the gateway.',
        'starting.copy': 'Copy',
        'starting.tokenSaved': 'The token was also saved at:',
        'starting.openChat': 'Open Chat',
        'starting.error': 'Error starting Gateway:',
        'starting.details': 'View details',
        'starting.retry': 'Try Again',
        
        // Additional Info (Vault)
        'vault.title': 'Information Vault (Optional)',
        'vault.description': 'Store sensitive information securely. All data is encrypted locally.',
        'vault.passwords': 'Passwords',
        'vault.passwordsDesc': 'Service passwords, accounts, etc.',
        'vault.creditCards': 'Credit Cards',
        'vault.creditCardsDesc': 'Card numbers, CVV, expiry date',
        'vault.apiKeys': 'API Keys',
        'vault.apiKeysDesc': 'Keys from other AIs and services',
        'vault.notes': 'Secure Notes',
        'vault.notesDesc': 'Other confidential information',
        'vault.aiRules': 'AI Rules',
        'vault.aiRulesDesc': 'System prompts, custom instructions',
        'vault.addPassword': '+ Add Password',
        'vault.addCard': '+ Add Card',
        'vault.addApiKey': '+ Add API Key',
        'vault.addNote': '+ Add Note',
        'vault.addAiRule': '+ Add Rule',
        'vault.serviceName': 'Service Name',
        'vault.username': 'Username/Email',
        'vault.password': 'Password',
        'vault.cardNumber': 'Card Number',
        'vault.cardHolder': 'Cardholder Name',
        'vault.expiryDate': 'Expiry Date (MM/YY)',
        'vault.cvv': 'CVV',
        'vault.apiKeyName': 'API Name',
        'vault.apiKeyValue': 'API Key',
        'vault.noteTitle': 'Title',
        'vault.noteContent': 'Content',
        'vault.ruleTitle': 'Rule Name',
        'vault.ruleContent': 'Instructions for AI',
        'vault.ruleActive': 'Activate this rule',
        'vault.save': 'Save',
        'vault.cancel': 'Cancel',
        'vault.delete': 'Delete',
        'vault.edit': 'Edit',
        'vault.show': 'Show',
        'vault.hide': 'Hide',
        'vault.copy': 'Copy',
        'vault.copied': 'Copied!',
        'vault.skip': 'Skip (Configure Later)',
        'vault.continue': 'Continue',
        'vault.back': 'Back',
        'vault.encrypted': 'Encrypted',
        'vault.noItems': 'No items added yet',
        'vault.confirmDelete': 'Are you sure you want to delete this item?',
        
        // Status Messages
        'status.tokenGenerated': 'Token generated automatically',
        'status.configSaved': 'Configuration saved successfully!',
        'status.apiConfigured': 'API key configured',
        'status.savingConfig': 'Saving configuration...',
        'status.startingGateway': 'Starting Gateway...',
        'status.loadingChat': 'Loading chat interface...',
        'status.ready': 'Ready to configure',
        
        // Errors
        'error.critical': 'CRITICAL ERROR: Model incompatible with provider!',
        'error.configNotSaved': 'Configuration was NOT saved.',
        'error.invalidModel': 'The model does not belong to the provider',
        'error.selectValid': 'Please select a valid model.',
        
        // Common
        'common.local': 'Local',
        'common.token': 'Token',
        'common.copied': '✅ Copied!'
    },
    
    'es-ES': {
        // Welcome Screen
        'welcome.title': 'Bienvenido a la Configuración de Ultron Gateway',
        'welcome.description1': 'Este asistente le guiará a través de la configuración inicial de su Gateway ULTRON.',
        'welcome.description2': 'El Gateway es el corazón de Ultron, conectando sus canales de mensajería a modelos de IA.',
        'welcome.autoConfig': '✓ Configuraciones Automáticas:',
        'welcome.mode': 'Modo: Local (esta máquina)',
        'welcome.port': 'Puerto: 18789 (predeterminado)',
        'welcome.auth': 'Autenticación: Token (generado automáticamente)',
        'welcome.startButton': 'Iniciar Configuración →',
        
        // Language Selection
        'language.title': 'Elegir Idioma',
        'language.description': 'Seleccione el idioma de la interfaz:',
        'language.portuguese': 'Português (Brasil)',
        'language.english': 'English (United States)',
        'language.spanish': 'Español',
        'language.french': 'Français',
        'language.german': 'Deutsch',
        'language.continue': 'Continuar →',
        
        // Execution Mode
        'execution.title': 'Modo de Ejecución',
        'execution.description': 'Elija dónde la IA ejecutará comandos y herramientas:',
        'execution.host.title': 'Host (PC del Usuario)',
        'execution.host.description': 'La IA ejecuta comandos directamente en su computadora. Más rápido, pero menos seguro.',
        'execution.sandbox.title': 'Sandbox (Docker)',
        'execution.sandbox.description': 'La IA ejecuta comandos en un entorno aislado. Más seguro, pero requiere Docker.',
        'execution.continue': 'Continuar →',
        
        // Network Configuration
        'network.title': 'Configuración de Red',
        'network.description': 'Configure la dirección IP donde el Gateway escuchará:',
        'network.loopback': 'Loopback (127.0.0.1)',
        'network.loopbackDesc': 'Solo conexiones locales (más seguro)',
        'network.lan': 'LAN',
        'network.lanDesc': 'Permite conexiones de red local',
        'network.auto': 'Auto (0.0.0.0)',
        'network.autoDesc': 'Acepta conexiones de cualquier red',
        'network.continue': 'Continuar →',
        
        // Provider Selection
        'provider.title': 'Elegir Proveedor de IA',
        'provider.description': 'Seleccione qué proveedor de modelos de IA desea usar:',
        'provider.google': 'Google',
        'provider.googleDesc': 'Gemini 2.0, Gemini 1.5 Pro/Flash',
        'provider.claude': 'Claude (Anthropic)',
        'provider.claudeDesc': 'Claude Opus 4.5, Sonnet 4, 3.5 Sonnet',
        'provider.openrouter': 'OpenRouter',
        'provider.openrouterDesc': 'Acceso a múltiples modelos vía API unificada',
        'provider.grok': 'Grok (xAI)',
        'provider.grokDesc': 'Grok Beta, Grok Vision Beta',
        'provider.openai': 'OpenAI',
        'provider.openaiDesc': 'GPT-4 Turbo, GPT-4, GPT-3.5 Turbo',
        'provider.local': 'Modelos Locales',
        'provider.localDesc': 'Ollama - Ejecute modelos localmente en su computadora',
        'provider.continue': 'Continuar →',
        'provider.back': '← Volver',
        
        // API Key
        'apikey.title': 'Clave API de',
        'apikey.howto': 'Cómo obtener su clave API:',
        'apikey.step1': 'Visite:',
        'apikey.step2': 'Inicie sesión o cree una cuenta',
        'apikey.step3': 'Genere una nueva clave API',
        'apikey.step4': 'Pegue la clave en el campo a continuación',
        'apikey.label': 'Clave API:',
        'apikey.secure': 'Su clave se almacenará de forma segura localmente',
        'apikey.continue': 'Continuar →',
        'apikey.back': '← Volver',
        
        // Model Selection
        'model.title': 'Elegir Modelo de IA',
        'model.description': 'Seleccione qué modelo de',
        'model.youWantToUse': 'desea usar:',
        'model.finish': '✅ Finalizar e Iniciar Gateway',
        'model.back': '← Volver',
        
        // API Test
        'apitest.title': 'Prueba de Conexión API',
        'apitest.validating': 'Validando su clave API...',
        'apitest.provider': 'Proveedor:',
        'apitest.model': 'Modelo:',
        'apitest.testing': 'Probando conexión con el proveedor...',
        'apitest.success': '✓ ¡CONEXIÓN ESTABLECIDA CON ÉXITO!',
        'apitest.successDesc': 'Clave API válida y funcional.',
        'apitest.modelInfo': 'Modelo:',
        'apitest.failed': '✗ CONEXIÓN FALLIDA',
        'apitest.error': 'Error:',
        'apitest.errorDesc': 'Verifique su clave API e intente nuevamente.',
        'apitest.retry': '← Volver y Corregir',
        'apitest.skip': 'Omitir Prueba',
        'apitest.continue': 'Continuar →',
        
        // Starting
        'starting.completed': '✅ ¡Configuración Completada!',
        'starting.success': 'El Gateway Ultron ha sido configurado con éxito.',
        'starting.mode': 'Modo:',
        'starting.port': 'Puerto:',
        'starting.ip': 'IP:',
        'starting.auth': 'Auth:',
        'starting.provider': 'Proveedor:',
        'starting.model': 'Modelo:',
        'starting.title': 'Iniciando Gateway...',
        'starting.initializing': 'Gateway inicializando',
        'starting.token': 'Token:',
        'starting.info': 'Información:',
        'starting.configSaved': 'Configuración guardada en:',
        'starting.verified': '¡Gateway verificado y funcionando!',
        'starting.url': 'URL:',
        'starting.tokenTitle': 'Token del Gateway',
        'starting.tokenDesc': '¡Copie este token ahora! Lo necesitará para conectar el chat al gateway.',
        'starting.copy': 'Copiar',
        'starting.tokenSaved': 'El token también se guardó en:',
        'starting.openChat': 'Abrir Chat',
        'starting.error': 'Error al iniciar Gateway:',
        'starting.details': 'Ver detalles',
        'starting.retry': 'Intentar Nuevamente',
        
        // Additional Info (Vault)
        'vault.title': 'Bóveda de Información (Opcional)',
        'vault.description': 'Almacene información sensible de forma segura. Todos los datos están cifrados localmente.',
        'vault.passwords': 'Contraseñas',
        'vault.passwordsDesc': 'Contraseñas de servicios, cuentas, etc.',
        'vault.creditCards': 'Tarjetas de Crédito',
        'vault.creditCardsDesc': 'Números de tarjeta, CVV, fecha de vencimiento',
        'vault.apiKeys': 'Claves de API',
        'vault.apiKeysDesc': 'Claves de otras IAs y servicios',
        'vault.notes': 'Notas Seguras',
        'vault.notesDesc': 'Otra información confidencial',
        'vault.aiRules': 'Reglas para IA',
        'vault.aiRulesDesc': 'Prompts del sistema, instrucciones personalizadas',
        'vault.addPassword': '+ Agregar Contraseña',
        'vault.addCard': '+ Agregar Tarjeta',
        'vault.addApiKey': '+ Agregar Clave API',
        'vault.addNote': '+ Agregar Nota',
        'vault.addAiRule': '+ Agregar Regla',
        'vault.serviceName': 'Nombre del Servicio',
        'vault.username': 'Usuario/Email',
        'vault.password': 'Contraseña',
        'vault.cardNumber': 'Número de Tarjeta',
        'vault.cardHolder': 'Nombre en la Tarjeta',
        'vault.expiryDate': 'Vencimiento (MM/AA)',
        'vault.cvv': 'CVV',
        'vault.apiKeyName': 'Nombre de la API',
        'vault.apiKeyValue': 'Clave API',
        'vault.noteTitle': 'Título',
        'vault.noteContent': 'Contenido',
        'vault.ruleTitle': 'Nombre de la Regla',
        'vault.ruleContent': 'Instrucciones para la IA',
        'vault.ruleActive': 'Activar esta regla',
        'vault.save': 'Guardar',
        'vault.cancel': 'Cancelar',
        'vault.delete': 'Eliminar',
        'vault.edit': 'Editar',
        'vault.show': 'Mostrar',
        'vault.hide': 'Ocultar',
        'vault.copy': 'Copiar',
        'vault.copied': '¡Copiado!',
        'vault.skip': 'Omitir (Configurar Después)',
        'vault.continue': 'Continuar',
        'vault.back': 'Volver',
        'vault.encrypted': 'Cifrado',
        'vault.noItems': 'No se han agregado elementos aún',
        'vault.confirmDelete': '¿Está seguro de que desea eliminar este elemento?',
        
        // Status Messages
        'status.tokenGenerated': 'Token generado automáticamente',
        'status.configSaved': '¡Configuración guardada con éxito!',
        'status.apiConfigured': 'Clave API configurada',
        'status.savingConfig': 'Guardando configuración...',
        'status.startingGateway': 'Iniciando Gateway...',
        'status.loadingChat': 'Cargando interfaz de chat...',
        'status.ready': 'Listo para configurar',
        
        // Errors
        'error.critical': 'ERROR CRÍTICO: ¡Modelo incompatible con proveedor!',
        'error.configNotSaved': 'La configuración NO se guardó.',
        'error.invalidModel': 'El modelo no pertenece al proveedor',
        'error.selectValid': 'Por favor, seleccione un modelo válido.',
        
        // Common
        'common.local': 'Local',
        'common.token': 'Token',
        'common.copied': '✅ ¡Copiado!'
    }
};

// Idioma atual (padrão: português)
let currentLanguage = 'pt-BR';

// Função para obter tradução
function t(key) {
    const lang = translations[currentLanguage] || translations['pt-BR'];
    return lang[key] || key;
}

// Função para mudar idioma
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        // Salvar preferência no localStorage
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('ultron.language', lang);
        }
        return true;
    }
    return false;
}

// Função para carregar idioma salvo
function loadSavedLanguage() {
    if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('ultron.language');
        if (saved && translations[saved]) {
            currentLanguage = saved;
        }
    }
}

// Carregar idioma ao iniciar
loadSavedLanguage();

// Exportar funções
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { t, setLanguage, loadSavedLanguage, currentLanguage };
}
