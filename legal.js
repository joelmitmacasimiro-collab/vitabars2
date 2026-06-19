// Completa estos datos antes de publicar el Libro de Reclamaciones.
const LEGAL_CONFIG = {
  businessName: "PARA ELLAS S.A.C.",
  ruc: "20600582802",
  address: "Calle Los Osos N.° 435, Rinconada del Lago Etapa, La Molina, Lima, Perú",
  claimsEmail: "vitabarsperu@gmail.com",
  // Endpoint propio o de un servicio de formularios que acepte JSON por POST.
  claimsEndpoint: "",
  phone: "+51 947 227 596"
};

const claimForm = document.querySelector('#claimForm');
const claimDate = document.querySelector('#claimDate');

if (claimDate) claimDate.value = new Date().toISOString().slice(0,10);

function makeClaimCode(){
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  const sequence = String(Number(localStorage.getItem('vitabars_claim_sequence') || 0) + 1).padStart(4,'0');
  localStorage.setItem('vitabars_claim_sequence', String(Number(sequence)));
  return `VITA-${stamp}-${sequence}`;
}

function claimAsText(data, code){
  return `LIBRO DE RECLAMACIONES VIRTUAL - VITABARS\nCódigo: ${code}\nFecha: ${data.get('date')}\n\nCONSUMIDOR\nNombre: ${data.get('fullName')}\nDocumento: ${data.get('documentType')} ${data.get('documentNumber')}\nDomicilio: ${data.get('consumerAddress')}\nTeléfono: ${data.get('phone')}\nCorreo: ${data.get('email')}\n\nDETALLE\nTipo: ${data.get('claimType')}\nProducto/servicio: ${data.get('product')}\nMonto: ${data.get('amount') || 'No aplica'}\nMotivo: ${data.get('detail')}\nPedido: ${data.get('request')}\n\nFirma declarada: ${data.get('signature')}\nCanal de respuesta: ${data.get('responseChannel')}`;
}

if (claimForm) claimForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!claimForm.reportValidity()) return;
  const data = new FormData(claimForm);
  const code = makeClaimCode();
  const text = claimAsText(data, code);
  const record = {code, createdAt:new Date().toISOString(), content:text};
  const records = JSON.parse(localStorage.getItem('vitabars_claims_local') || '[]');
  records.push(record);
  localStorage.setItem('vitabars_claims_local', JSON.stringify(records));
  let received = false;
  if (LEGAL_CONFIG.claimsEndpoint) {
    try {
      const response = await fetch(LEGAL_CONFIG.claimsEndpoint, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(record)});
      received = response.ok;
    } catch (error) {
      received = false;
    }
  }
  document.querySelector('#claimCode').textContent = code;
  document.querySelector('#claimStatus').textContent = received
    ? 'La hoja fue enviada al canal receptor configurado. Conserva esta copia y tu código de identificación.'
    : 'Se guardó una copia local en este dispositivo, pero aún no existe un canal receptor configurado. Descárgala o imprímela; el negocio debe habilitar el endpoint antes de publicar.';
  document.querySelector('#claimResult').classList.add('show');
  document.querySelector('#downloadClaim').dataset.content = text;
  document.querySelector('#claimResult').scrollIntoView({behavior:'smooth',block:'center'});
});

document.querySelector('#downloadClaim')?.addEventListener('click', event => {
  const blob = new Blob([event.currentTarget.dataset.content || ''], {type:'text/plain;charset=utf-8'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `reclamo-${document.querySelector('#claimCode').textContent}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
});

document.querySelector('#printClaim')?.addEventListener('click', () => window.print());
