import { library, dom } from '@fortawesome/fontawesome-svg-core';
import {
    faEnvelope,
    faMoon,
    faSun,
    faCircleHalfStroke,
    faCode,
    faPen,
    faBriefcase,
    faChevronLeft,
    faChevronRight,
    faGrip,
    faFileLines,
    faDiagramProject,
    faUser,
    faHouse
} from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

// icons currently used in the project
library.add(
    faEnvelope,
    faMoon,
    faSun,
    faCircleHalfStroke,
    faCode,
    faPen,
    faBriefcase,
    faChevronLeft,
    faChevronRight,
    faGrip,
    faFileLines,
    faGithub,
    faLinkedin,
    faDiagramProject,
    faUser,
    faHouse
);
dom.watch();