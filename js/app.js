import { supabase } from './supabase.js';

let streamActive = false;
const video = document.getElementById('webcam');
const statusElem = document.getElementById('camera-status');

async function initCamera() {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (video) {
        video.srcObject = stream;
        streamActive = true;
        if (statusElem) statusElem.textContent = 'Câmera ativa';
      }
    } else {
      if (statusElem) statusElem.textContent = 'Câmera não suportada (usando imagem padrão)';
    }
  } catch (err) {
    console.warn('Câmera indisponível ou permissão negada:', err);
    if (statusElem) statusElem.textContent = 'Câmera indisponível (usando imagem padrão)';
    streamActive = false;
  }
}

function capturePhoto() {
  const canvas = document.getElementById('canvas');
  if (streamActive && video && video.readyState === video.HAVE_ENOUGH_DATA) {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  }
  return getPlaceholderImage();
}

function getPlaceholderImage() {
  return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="100%" height="100%" fill="%23e0e0e0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23666666">Sem Foto</text></svg>';
}

function renderComprovante(funcionario, tipo, dataHora, photoUrl) {
  const compElem = document.getElementById('comprovante');
  document.getElementById('comp-nome').textContent = funcionario.nome_completo || funcionario.nome || 'N/A';
  document.getElementById('comp-matricula').textContent = funcionario.matricula;
  document.getElementById('comp-cargo').textContent = funcionario.cargo || 'N/A';
  document.getElementById('comp-tipo').textContent = tipo;

  const formattedDate = new Date(dataHora).toLocaleString('pt-BR');
  document.getElementById('comp-data-hora').textContent = formattedDate;

  // Render photo
  const photoContainer = document.getElementById('comp-foto-container');
  photoContainer.innerHTML = `<img src="${photoUrl}" class="foto-comprovante" alt="Foto do registro" />`;

  // Render QRCode
  const qrContainer = document.getElementById('qrcode');
  qrContainer.innerHTML = '';

  const qrData = JSON.stringify({
    matricula: funcionario.matricula,
    nome: funcionario.nome_completo || funcionario.nome,
    tipo: tipo,
    dataHora: formattedDate
  });

  if (window.QRCode) {
    new window.QRCode(qrContainer, {
      text: qrData,
      width: 128,
      height: 128,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: window.QRCode.CorrectLevel ? window.QRCode.CorrectLevel.H : 2
    });
  } else {
    qrContainer.textContent = 'QR Code: ' + qrData;
  }

  compElem.classList.add('visible');
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const msgElem = document.getElementById('mensagem');
  msgElem.textContent = 'Processando...';
  msgElem.style.color = '#333';

  const matriculaInput = document.getElementById('matricula');
  const tipoSelect = document.getElementById('tipo');

  const matricula = matriculaInput.value.trim();
  const tipo_registro = tipoSelect.value;

  try {
    // 1. Fetch employee from Supabase
   const { data: funcionario, error } = await supabase
  .from('funcionarios')
  .select('*')
  .ilike('matricula', matriculaInput.trim())
  .single();

    if (funcError || !funcionario) {
      msgElem.textContent = 'Funcionário não encontrado para a matrícula informada.';
      msgElem.style.color = 'red';
      return;
    }

    // 2. Save entry to registros_ponto
    const dataHoraIso = new Date().toISOString();
    const { data: registro, error: regError } = await supabase
      .from('registros_ponto')
      .insert([
        {
          funcionario_id: funcionario.id,
          tipo_registro: tipo_registro,
          data_hora: dataHoraIso
        }
      ])
      .select();

    if (regError) {
      console.error('Erro ao salvar registro de ponto:', regError);
      msgElem.textContent = 'Erro ao salvar o registro de ponto no sistema.';
      msgElem.style.color = 'red';
      return;
    }

    // 3. Capture photo or placeholder
    const photoUrl = capturePhoto();

    // 4. Render ticket and QRCode
    renderComprovante(funcionario, tipo_registro, dataHoraIso, photoUrl);

    msgElem.textContent = 'Ponto registrado com sucesso!';
    msgElem.style.color = 'green';

    // 5. Trigger print
    setTimeout(() => {
      window.print();
    }, 500);

  } catch (err) {
    console.error('Erro inesperado:', err);
    msgElem.textContent = 'Erro inesperado ao registrar o ponto: ' + err.message;
    msgElem.style.color = 'red';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initCamera();

  const form = document.getElementById('ponto-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
});
