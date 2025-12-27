
import { jvTemplate } from './jv';
import { JVTemplate as JVComponent } from '@/components/resume/templates/JVTemplate';

export const templates = {
    jv: {
        ...jvTemplate,
        component: JVComponent
    }
};

export const getTemplate = (id) => templates[id] || templates.jv;
