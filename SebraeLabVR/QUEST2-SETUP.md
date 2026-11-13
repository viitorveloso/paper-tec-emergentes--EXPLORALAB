# Preparação do Meta Quest 2

Destino preparado: aplicativo Android executado diretamente no Quest 2. Para transferência, siga LEIA-ME-OUTRA-MAQUINA.txt. Quest2.ps1 agora encontra o projeto pela própria pasta, sem exigir a junção deste computador; use -EditorPath para uma instalação personalizada do editor.

## Estado real

Unity Hub e Unity CLI 1.0.0 foram instalados. O editor correto é 6000.0.83f1, conforme ProjectSettings/ProjectVersion.txt. Os instaladores do editor e dos módulos Android estão sendo baixados; isso ainda não significa que o editor ou o suporte Android estejam instalados.

A instalação inicial foi interrompida porque a confirmação de administrador do Windows foi cancelada ou expirou. Foi iniciado um download separado, sem privilégios de administrador. Como o usuário não dispõe da senha de administrador do Windows, Continue-Quest2Setup.ps1 aguarda o download e registra o estado, sem iniciar automaticamente outra instalação. O download permanece ativo enquanto o computador estiver ligado. Para continuar quando um administrador estiver disponível, abra RETOMAR-QUEST2.cmd na pasta do projeto: ele retoma a instalação pelo cache, valida o projeto no editor e tenta gerar o APK, parando se houver erro. A janela de segurança do Windows e o login/licenciamento Unity dependem do usuário.

O arquivo Tools/VRSetup/setup-status.json registra a fase corrente. Os logs editor-download.log e editor-download-errors.log acompanham o download. resume-install.log e resume-install-errors.log acompanharão a instalação. unity-validate.log existirá quando o editor puder executar a validação.

O Hub também estava com uma instalação de 6000.6.9f1 na fila. Essa não é a versão original do projeto; foi solicitado ao usuário pausar esse download. Não migre o projeto para essa versão antes de validar a original.

## Caminho do projeto

C:\UnityProjects\SebraeLabVR é uma junção para a pasta original. Nenhum arquivo foi movido ou duplicado. Esse caminho curto evita repetir o problema de caminhos muito longos encontrado na extração e reduz problemas com ferramentas Android.

## Comandos preparados

Em PowerShell, a partir da pasta do projeto:

- `powershell -NoProfile -ExecutionPolicy Bypass -File Tools/VRSetup/Quest2.ps1 -Action Install`: retoma a instalação oficial pelo cache; pode solicitar autorização administrativa.
- `... -Action Validate`: abre o editor em lote, importa/compila para Android e aplica a configuração de desenvolvimento do Quest 2.
- `... -Action Build`: gera Builds/Quest2/SebraeLabVR-Quest2.apk, somente se a compilação for bem-sucedida.
- `... -Action Devices`: lista os dispositivos ADB após a instalação do SDK.

No Unity, os mesmos comandos estão em SebraeLab > Quest 2. A configuração usa Android ARM64, IL2CPP, ASTC e a cena Sebrae.unity. O APK é de desenvolvimento com assinatura de teste; publicação em loja não está incluída. O script de editor foi preparado, mas só estará validado quando o Unity conseguir compilá-lo.

## Etapa física no Quest 2

Conecte o Quest 2 por USB com cabo de dados, habilite o modo de desenvolvedor com sua própria conta Meta e aceite a depuração USB dentro dos óculos. Se o Windows não reconhecer o aparelho, será necessário instalar/configurar o driver ADB oficial da Meta. O headset não foi detectado conectado durante a preparação.

Não foi gerado nem instalado um APK nesta etapa. Desempenho, controles, conforto e navegação precisam de teste no aparelho.

Fontes oficiais:

- https://unity.com/releases/editor/whats-new/6000.0.83f1
- https://docs.unity.com/en-us/unity-cli/use-unity-cli
- https://developers.meta.com/vr/documentation/unity/unity-development-requirements/
- https://developers.meta.com/vr/documentation/native/android/mobile-device-setup/

