const pattern_textarea  = document.getElementById('pattern');
const start_button      = document.getElementById('start_button');
const configuration_selector = document.getElementById('configuration');
const step_highlight_checkbox = document.getElementById('step_highlight')


function stop(){
    start_button.textContent= "Comenzar";
    kun_instance.stop();
}

function startStop() {
    Tone.start();
  if (kun_instance.isPlaying()) {
    stop();
  } else {
    start_button.textContent= (kun_instance.isFirstStep() ? "Detener" : "Comenzar");
    render();
    kun_instance.processPatternToStepsData(pattern_textarea.value);

    kun_instance.start();
  }
}

function selectStepInTextArea(step){
    pattern_textarea.focus();
    pattern_textarea.setSelectionRange(step.position, (step.position + 1));
}



function playStep(time) {
    let step = kun_instance.getNextStep();
    if(kun_instance.config.step.highlight){
        selectStepInTextArea(step);
    }

    kun_instance.executeStep(step,time);
}

function render(){
    let render_value = kun_instance.render();
     if(render_value  !=  null){
        pattern_textarea.value = render_value;
     }
}

function processPattern(pattern_value,with_render){
    kun_instance.setPattern(pattern_value);
    if(with_render){render()};
}

/// EVENTOS
start_button.addEventListener('click', async () => {
    await Tone.start();
    kun_instance.initialize();
});

document.getElementById('speed').addEventListener('input', function () {
  kun_instance.speed = parseInt(this.value);
  if (kun_instance.isPlaying()) {
    Tone.Transport.bpm.rampTo(kun_instance.speed,1);
  }
});

pattern_textarea.addEventListener('input', function () {
    processPattern(this.value,true);
});

/**
 * Ante cambios en la configuracion (de Metricas), se deberá renderizar el patron correspondiente
 */
configuration_selector.addEventListener('change',function () {
    switch(this.value){
        case '0020':    kun_instance.time_signature = TIME_SIGNATURE_NONE_2;
                        break;
        case '0040':    kun_instance.time_signature = TIME_SIGNATURE_NONE_4;
                        break;
        case '3420':    kun_instance.time_signature = TIME_SIGNATURE_3_4_2;
                        break;
        case '3440':    kun_instance.time_signature = TIME_SIGNATURE_3_4_4;
                        break;
        case '6820':    kun_instance.time_signature = TIME_SIGNATURE_6_8_2;
                        break;
        case '6840':    kun_instance.time_signature = TIME_SIGNATURE_6_8_4;
                        break;
        case '6821':    kun_instance.time_signature = TIME_SIGNATURE_6_8_2_BINARY;
                        break;
        case '6841':    kun_instance.time_signature = TIME_SIGNATURE_6_8_4_BINARY;
                        break;


        default:    //NO deberia darse...
    }

    pattern_textarea.cols = kun_instance.time_signature.text.cols;
    pattern_textarea.placeholder = kun_instance.time_signature.text.placeholder;

    processPattern(pattern_textarea.value,true)

});

step_highlight_checkbox.addEventListener('change',function () {
    kun_instance.config.step.highlight = this.checked;
});

window.addEventListener("load", (event) => {
    // Se toma el valor del patron
    processPattern(pattern_textarea.value, true);
    document.getElementById('version').innerHTML= kun_instance.development.version;
});

document.addEventListener("visibilitychange", () => {
    if(document.hidden){
        stop();
    }
});
