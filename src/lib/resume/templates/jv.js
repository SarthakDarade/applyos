import { escapeLatex } from '../utils';

export const jvTemplate = {
  id: 'jv',
  name: 'JV',
  description: 'Professional, clean, single-column layout optimized for ATS.',
  // The Generator
  generateLatex: (data) => {
    const { personal, summary, experience, education, skills, projects, achievements, internships, hackathons, github_projects } = data;

    // Helper for URLs in href
    const escapeUrl = (url) => {
      if (!url) return '';
      return url.replace(/%/g, '\\%').replace(/#/g, '\\#');
    };

    // Normalize skills to array format
    let normalizedSkills = [];
    if (Array.isArray(skills)) {
      normalizedSkills = skills;
    } else if (skills) {
      if (skills.technical?.length) normalizedSkills.push({ name: 'Languages/Technologies', items: skills.technical });
      if (skills.soft?.length) normalizedSkills.push({ name: 'Soft Skills', items: skills.soft });
    }

    // Handle projects vs github_projects
    const activeProjects = github_projects || projects || [];

    // Default Order
    const defaultOrder = ['summary', 'education', 'experience', 'projects', 'skills', 'achievements'];
    // Use data.meta.sectionOrder if available, otherwise default
    const order = data.meta?.sectionOrder && Array.isArray(data.meta.sectionOrder) ? data.meta.sectionOrder : defaultOrder;

    // Defines Renderers for each section
    const renderers = {
      summary: () => summary ? `
%-----------PROFILE SUMMARY-----------
\\section{Profile Summary}
{\\small ${escapeLatex(summary)}}
\\vspace{-5pt}
` : '',
      education: () => education?.length > 0 ? `
%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
  ${education.map(edu => `
    \\resumeSubheading
      {${escapeLatex(edu.school || '')}}{${escapeLatex(edu.dates || '')}}
      {${escapeLatex(edu.degree || '')}}{${escapeLatex(edu.location || '')}}
  `).join('')}
  \\resumeSubHeadingListEnd
` : '',
      achievements: () => (achievements || data.achievements)?.length > 0 ? `
%-----------ACHIEVEMENTS-----------
\\section{Achievements}
  \\resumeAchievementListStart
    ${(achievements || data.achievements).map(ach => {
        const text = typeof ach === 'object' && ach !== null ? (ach.description || ach.title || ach.name || '') : ach;
        return `\\resumeItem{${escapeLatex(text)}}`;
      }).join('\n')}
  \\resumeItemListEnd
` : '',
      certifications: () => data.certifications?.length > 0 ? `
%-----------CERTIFICATIONS-----------
\\section{Certifications}
  \\resumeSubHeadingListStart
    ${data.certifications.map(cert => {
        const title = cert.name || cert.title || '';
        const org = cert.organization || cert.organisation || '';
        const d = cert.dates || '';
        const exp = cert.expiry || '';
        const displayDates = (d && exp) ? `${d} -- ${exp}` : (d || exp);
        const credId = cert.credentialId || '';
        const items = (Array.isArray(cert.description) ? cert.description : [cert.description]).flat().filter(Boolean);

        return `
    \\resumeSubheading
      {${escapeLatex(title)}}{${escapeLatex(displayDates)}}
      {${escapeLatex(org)}}{${credId ? `ID: ${escapeLatex(credId)}` : ''}}
      ${items.length > 0 ? `
      \\resumeItemListStart
        ${items.map(item => `\\resumeItem{${escapeLatex(item)}}`).join('')}
      \\resumeItemListEnd
      ` : ''}
  `}).join('')}
  \\resumeSubHeadingListEnd
` : '',
      awards: () => data.awards?.length > 0 ? `
%-----------AWARDS-----------
\\section{Honors & Awards}
  \\resumeSubHeadingListStart
    ${data.awards.map(award => {
        const title = award.name || award.title || '';
        const org = award.organization || award.organisation || '';
        const d = award.dates || '';
        const items = (Array.isArray(award.description) ? award.description : [award.description]).flat().filter(Boolean);

        return `
    \\resumeSubheading
      {${escapeLatex(title)}}{${escapeLatex(d)}}
      {${escapeLatex(org)}}{}
      ${items.length > 0 ? `
      \\resumeItemListStart
        ${items.map(item => `\\resumeItem{${escapeLatex(item)}}`).join('')}
      \\resumeItemListEnd
      ` : ''}
  `}).join('')}
  \\resumeSubHeadingListEnd
` : '',
      experience: () => experience?.length > 0 ? `
%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
  ${experience.map(exp => {
        const items = (Array.isArray(exp.description) ? exp.description : [exp.description]).flat().filter(Boolean);
        return `
    \\resumeSubheading
      {${escapeLatex(exp.company || '')}}{${escapeLatex(exp.dates || '')}}
      {${escapeLatex(exp.role || '')}}{${escapeLatex(exp.location || '')}}
      ${items.length > 0 ? `
      \\resumeItemListStart
        ${items.map(item => `\\resumeItem{${escapeLatex(item)}}`).join('')}
      \\resumeItemListEnd
      ` : ''}
  `}).join('')}
  \\resumeSubHeadingListEnd
` : '',
      internships: () => internships?.length > 0 ? `
%-----------INTERNSHIPS-----------
\\section{Internships}
  \\resumeSubHeadingListStart
  ${internships.map(exp => {
        const company = exp.company || '';
        const role = exp.role || '';
        const dates = exp.dates || '';
        const location = exp.location || '';
        const items = (Array.isArray(exp.description) ? exp.description : [exp.description]).flat().filter(Boolean);
        return `
    \\resumeSubheading
      {${escapeLatex(company)}}{${escapeLatex(dates)}}
      {${escapeLatex(role)}}{${escapeLatex(location)}}
      ${items.length > 0 ? `
      \\resumeItemListStart
        ${items.map(item => `\\resumeItem{${escapeLatex(item)}}`).join('')}
      \\resumeItemListEnd
      ` : ''}
  `}).join('')}
  \\resumeSubHeadingListEnd
` : '',
      hackathons: () => hackathons?.length > 0 ? `
%-----------HACKATHONS-----------
\\section{Hackathons}
  \\resumeSubHeadingListStart
  ${hackathons.map(hck => {
        const items = (Array.isArray(hck.description) ? hck.description : [hck.description]).flat().filter(Boolean);
        return `
      \\item
          \\textbf{${escapeLatex(hck.name)}} \\hfill ${escapeLatex(hck.dates || '')}
          ${items.length > 0 ? `
          \\resumeItemListStart
              ${items.map(item => `\\resumeItem{${escapeLatex(item)}}`).join('\n')}
          \\resumeItemListEnd
          ` : ''}
  `}).join('')}
  \\resumeSubHeadingListEnd
` : '',
      projects: () => activeProjects?.length > 0 ? `
%-----------PROJECTS-----------
\\section{Projects}
    \\resumeSubHeadingListStart
    ${activeProjects.map(proj => {
        const title = proj.name || '';
        const dates = proj.dates || '';
        const items = (Array.isArray(proj.description) ? proj.description : [proj.description]).flat().filter(Boolean);

        return `
      \\item
          \\textbf{${escapeLatex(title)}} \\hfill ${escapeLatex(dates)}
          ${items.length > 0 ? `
          \\resumeItemListStart
            ${items.map(item => `\\resumeItem{${escapeLatex(item)}}`).join('')}
          \\resumeItemListEnd
          ` : ''}
    `}).join('')}
    \\resumeSubHeadingListEnd
` : '',
      skills: () => normalizedSkills.length > 0 ? `
%-----------SKILLS-----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}, itemsep=0pt, topsep=2pt]
    \\small{
     ${normalizedSkills.map(skill => `\\item \\textbf{${escapeLatex(skill.name)}}: ${escapeLatex(Array.isArray(skill.items) ? skill.items.join(', ') : skill.items)}`).join('\n')}
    }
 \\end{itemize}
` : '',
      // New Sections
      objective: () => data.objective ? `
%-----------OBJECTIVE-----------
\\section{Career Objective}
{\\small ${escapeLatex(data.objective)}}
\\vspace{-5pt}
` : '',
      leadership: () => data.leadership?.length > 0 ? `
%-----------LEADERSHIP-----------
\\section{Leadership}
  \\resumeSubHeadingListStart
  ${data.leadership.map(exp => {
        const company = exp.company || '';
        const role = exp.role || '';
        const dates = exp.dates || '';
        const location = exp.location || '';
        const items = (Array.isArray(exp.description) ? exp.description : [exp.description]).flat().filter(Boolean);
        return `
    \\resumeSubheading
      {${escapeLatex(company)}}{${escapeLatex(dates)}}
      {${escapeLatex(role)}}{${escapeLatex(location)}}
      ${items.length > 0 ? `
      \\resumeItemListStart
        ${items.map(item => `\\resumeItem{${escapeLatex(item)}}`).join('')}
      \\resumeItemListEnd
      ` : ''}
  `}).join('')}
  \\resumeSubHeadingListEnd
` : '',
      research: () => data.research?.length > 0 ? `
%-----------RESEARCH-----------
\\section{Research}
    \\resumeSubHeadingListStart
    ${data.research.map(res => {
        const title = res.name || '';
        const company = res.company || '';
        const role = res.role || '';
        const dates = res.dates || '';
        const items = (Array.isArray(res.description) ? res.description : [res.description]).flat().filter(Boolean);
        return `
      \\resumeSubheading
          {${escapeLatex(title)}}{${escapeLatex(dates)}}
          {${escapeLatex(company)}}{${escapeLatex(role)}}
          ${items.length > 0 ? `
          \\resumeItemListStart
            ${items.map(item => `\\resumeItem{${escapeLatex(item)}}`).join('')}
          \\resumeItemListEnd
          ` : ''}
    `}).join('')}
    \\resumeSubHeadingListEnd
` : '',
      publications: () => data.publications?.length > 0 ? `
%-----------PUBLICATIONS-----------
\\section{Publications}
    \\resumeSubHeadingListStart
    ${data.publications.map(pub => {
        const title = pub.name || '';
        const authors = pub.authors || '';
        const venue = pub.venue || '';
        const dates = pub.dates || '';
        const url = pub.url || '';

        return `
      \\item
          \\textbf{${escapeLatex(title)}} $|$ \\textit{${escapeLatex(venue)}} \\hfill ${escapeLatex(dates)}
          \\resumeItemListStart
             \\resumeItem{${escapeLatex(authors)}}
          \\resumeItemListEnd
    `}).join('')}
    \\resumeSubHeadingListEnd
` : '',
    };

    return `
\\documentclass[letterpaper, 11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
% \\usepackage{marvosym}
\\usepackage[usenames, dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{multicol}
\\setlength{\\multicolsep}{-3.0pt}
\\setlength{\\columnsep}{-1pt}

% \\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Margins
\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.19in}
\\addtolength{\\topmargin}{-.7in}
\\addtolength{\\textheight}{1.4in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Ensure that generate pdf is machine readable / ATS parsable
% \\pdfgentounicode=1

% -------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\classesList}[4]{
  \\item\\small{
    {#1 #2 #3 #4 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
  \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & \\textbf{\\small #2} \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
  \\end{tabular*}\\vspace{0pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{0pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{1.001\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & \\textbf{\\small #2} \\\\
    \\end{tabular*}\\vspace{0pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\small$\\bullet$}}$}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\small$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=0.15in, label=\\small$\\bullet$, itemsep=4pt, topsep=0pt, partopsep=0pt, parsep=0pt]}
\\newcommand{\\resumeAchievementListStart}{\\begin{itemize}[leftmargin=0.15in, label=\\large$\\bullet$, itemsep=4pt, topsep=0pt, partopsep=0pt, parsep=0pt]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{4pt}}

% -------------------------------------------
%%%%%% RESUME STARTS HERE %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}

% ----------HEADING----------
\\begin{center}
    {\\Huge \\scshape ${escapeLatex(personal?.name || 'Your Name')}} \\\\ \\vspace{2pt}
    \\small ${escapeLatex(personal?.phone || '')} 
    ${personal?.email ? `$|$ \\href{mailto:${escapeUrl(personal.email)}}{\\underline{${escapeLatex(personal.email)}}}` : ''} 
    ${personal?.linkedin ? `$|$ \\href{${personal.linkedin.startsWith('http') ? escapeUrl(personal.linkedin) : `https://${escapeUrl(personal.linkedin)}`}}{\\underline{${escapeLatex(personal.linkedin)}}}` : ''}
    ${personal?.url ? `$|$ \\href{${personal.url.startsWith('http') ? escapeUrl(personal.url) : `https://${escapeUrl(personal.url)}`}}{\\underline{${escapeLatex(personal.url)}}}` : ''}
    \\vspace{-8pt}
\\end{center}

${order.map(key => renderers[key] ? renderers[key]() : '').join('\n')}

\\end{document}
`;
  }
};
