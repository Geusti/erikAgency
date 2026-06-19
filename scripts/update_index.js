const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '../public/index.html');
let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

// Replace image URLs
const supabaseBaseUrl = 'https://ntyrbhtdviconguqbugx.supabase.co/storage/v1/object/public/erik-media/';

htmlContent = htmlContent.replace(/src="img\//g, `src="${supabaseBaseUrl}`);
htmlContent = htmlContent.replace(/src="\/api\/videos\//g, `src="${supabaseBaseUrl}`);

// Insert Contact Form
const contactFormHtml = `
        <!-- CONTACT FORM SECTION -->
        <section id="contato" class="py-16 md:py-24 px-4 md:px-16 lg:px-24 bg-[#0a0a0a] relative border-t border-lux-gold-500/10">
            <div class="max-w-[1000px] mx-auto text-center mb-12">
                <div class="flex items-center justify-center gap-4 mb-4">
                    <span class="h-[1px] w-12 bg-lux-gold-500/50"></span>
                    <span class="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium text-lux-gold-500">CONTATO EXCLUSIVO</span>
                    <span class="h-[1px] w-12 bg-lux-gold-500/50"></span>
                </div>
                <h2 class="font-serif text-3xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
                    Pronto para estruturar o seu<br>
                    <span class="italic text-lux-gold-500">posicionamento de luxo?</span>
                </h2>
                <p class="font-sans text-sm md:text-base text-white/70 max-w-2xl mx-auto">
                    Preencha o formulário abaixo para iniciarmos seu diagnóstico personalizado de posicionamento de marca e captação de pacientes premium.
                </p>
            </div>

            <div class="max-w-[800px] mx-auto bg-[#141414] border border-lux-gold-500/10 rounded-2xl p-6 md:p-10 shadow-2xl">
                <form id="lead-form" class="flex flex-col gap-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="flex flex-col gap-2">
                            <label for="form-name" class="text-[10px] uppercase tracking-widest text-lux-gold-500 font-semibold">Nome Completo *</label>
                            <input type="text" id="form-name" required placeholder="Dr. Alexandre Silva" class="bg-[#0a0a0a] border border-lux-gold-500/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-lux-gold-500 transition-colors placeholder:text-white/20">
                        </div>
                        <div class="flex flex-col gap-2">
                            <label for="form-email" class="text-[10px] uppercase tracking-widest text-lux-gold-500 font-semibold">E-mail Corporativo *</label>
                            <input type="email" id="form-email" required placeholder="contato@clinica.com.br" class="bg-[#0a0a0a] border border-lux-gold-500/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-lux-gold-500 transition-colors placeholder:text-white/20">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="flex flex-col gap-2">
                            <label for="form-phone" class="text-[10px] uppercase tracking-widest text-lux-gold-500 font-semibold">Telefone / WhatsApp *</label>
                            <input type="tel" id="form-phone" required placeholder="(11) 99999-9999" class="bg-[#0a0a0a] border border-lux-gold-500/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-lux-gold-500 transition-colors placeholder:text-white/20">
                        </div>
                        <div class="flex flex-col gap-2">
                            <label for="form-specialty" class="text-[10px] uppercase tracking-widest text-lux-gold-500 font-semibold">Especialidade / Nome da Clínica</label>
                            <input type="text" id="form-specialty" placeholder="Cirurgia Plástica / Dermatologia" class="bg-[#0a0a0a] border border-lux-gold-500/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-lux-gold-500 transition-colors placeholder:text-white/20">
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="form-message" class="text-[10px] uppercase tracking-widest text-lux-gold-500 font-semibold">Quais são seus objetivos atuais de marca?</label>
                        <textarea id="form-message" rows="4" placeholder="Gostaria de elevar o ticket médio dos meus procedimentos..." class="bg-[#0a0a0a] border border-lux-gold-500/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-lux-gold-500 transition-colors resize-none placeholder:text-white/20"></textarea>
                    </div>

                    <button type="submit" id="form-submit-btn" class="mt-4 w-full bg-[#B89668] hover:bg-[#A38054] text-white font-sans text-xs uppercase tracking-[0.2em] font-bold py-4 rounded-md transition-colors flex justify-center items-center gap-2">
                        <span>Enviar Solicitação de Diagnóstico</span>
                        <span class="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                    <div id="form-status" class="hidden"></div>
                </form>
            </div>
        </section>
`;

if (!htmlContent.includes('id="lead-form"')) {
    htmlContent = htmlContent.replace('</main>', contactFormHtml + '\n    </main>');
    console.log("Contact form successfully added.");
} else {
    console.log("Contact form already exists.");
}

fs.writeFileSync(indexHtmlPath, htmlContent, 'utf8');
console.log("Index HTML updated successfully.");
