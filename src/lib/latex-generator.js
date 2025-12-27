export function generateLaTeX(data) {
  if (!data) return '';

  const {
    personal = {},
    summary = '',
    experience = [],
    education = [],
    skills = { technical: [], soft: [] },
    projects = [],
    certificates = [],
    languages = [],
    interests = [],
    achievements = []
  } = data;

  // Helper to escape special LaTeX characters
  const esc = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/{/g, '\\{')
      .replace(/}/g, '\\}')
      .replace(/~/g, '\\textasciitilde')
      .replace(/\^/g, '\\textasciicircum');
  };

  return `
\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{} 
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%


\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${esc(personal.name)}} \\\\ \\vspace{1pt}
    \\small ${esc(personal.phone)} $|$ \\href{mailto:${esc(personal.email)}}{\\underline{${esc(personal.email)}}} $|$ 
    ${esc(personal.linkedin) ? `\\href{${esc(personal.linkedin).startsWith('http') ? esc(personal.linkedin) : 'https://' + esc(personal.linkedin)}}{\\underline{${esc(personal.linkedin).replace(/^https?:\/\//, '')}}}` : ''} $|$
    ${esc([personal.location, personal.country].filter(Boolean).join(', '))}
\\end{center}


%-----------SUMMARY-----------
${summary ? `
\\section{Summary}
  \\small ${esc(summary)}
` : ''}


%-----------EXPERIENCE-----------
${experience.length > 0 ? `
\\section{Experience}
  \\resumeSubHeadingListStart
    ${experience.map(exp => `
      \\resumeSubheading
        {${esc(exp.company)}}{${esc(exp.dates)}}
        {${esc(exp.role)}}{${esc(exp.location || '')}}
      \\resumeItemListStart
        ${(Array.isArray(exp.description) ? exp.description : [exp.description])
      .map(desc => `\\resumeItem{${esc(desc)}}`).join('\n')}
      \\resumeItemListEnd
    `).join('')}
  \\resumeSubHeadingListEnd
` : ''}


%-----------PROJECTS-----------
${projects.length > 0 ? `
\\section{Projects}
    \\resumeSubHeadingListStart
      ${projects.map(proj => `
        \\resumeProjectHeading
          {\\textbf{${esc(proj.name)}} $|$ \\emph{${esc(proj.tech || '')}}}{${esc(proj.link ? `\\href{${proj.link}}{\\underline{Link}}` : '')}}
          \\resumeItemListStart
            \\resumeItem{${esc(proj.description)}}
          \\resumeItemListEnd
      `).join('')}
    \\resumeSubHeadingListEnd
` : ''}


%-----------EDUCATION-----------
${education.length > 0 ? `
\\section{Education}
  \\resumeSubHeadingListStart
    ${education.map(edu => `
      \\resumeSubheading
        {${esc(edu.school)}}{${esc(edu.dates)}}
        {${esc(edu.degree)}}{${esc(edu.location || '')}}
    `).join('')}
  \\resumeSubHeadingListEnd
` : ''}

%-----------CERTIFICATES-----------
${certificates.length > 0 ? `
\\section{Certificates}
  \\resumeSubHeadingListStart
    ${certificates.map(cert => `
      \\resumeProjectHeading
        {\\textbf{${esc(cert.name)}} $|$ ${esc(cert.issuer)}}{${esc(cert.date)}}
    `).join('')}
  \\resumeSubHeadingListEnd
` : ''}

%-----------SKILLS-----------
${(skills.technical?.length > 0 || skills.soft?.length > 0 || languages.length > 0) ? `
\\section{Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     ${skills.technical?.length > 0 ? `\\textbf{Keywords}{: ${esc(skills.technical.join(', '))}} \\\\` : ''}
     ${skills.soft?.length > 0 ? `\\textbf{Soft Skills}{: ${esc(skills.soft.join(', '))}} \\\\` : ''}
     ${languages.length > 0 ? `\\textbf{Languages}{: ${esc(languages.join(', '))}} \\\\` : ''}
    }}
 \\end{itemize}
` : ''}

%-----------ACHIEVEMENTS-----------
${achievements.length > 0 ? `
\\section{Achievements}
  \\resumeItemListStart
    ${achievements.map(ach => `\\resumeItem{${esc(ach.title)}}`).join('\n')}
  \\resumeItemListEnd
` : ''}

%-----------INTERESTS-----------
${interests.length > 0 ? `
\\section{Interests}
  \\small ${esc(interests.join(', '))}
` : ''}

%-------------------------------------------
\\end{document}
`;
}
