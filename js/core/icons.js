import { library, dom } from '@fortawesome/fontawesome-svg-core';
import {
    faMoon,
    faSun,
    faCircleHalfStroke,
    faCode,
    faPen,
    faBriefcase,
    faChevronLeft,
    faChevronRight,
    faGrip,
    faDiagramProject,
    faUser,
    faHouse,
    faUserGraduate,
    faCertificate,
    faBuilding,
    faFlask,
    faXmark,
    faArrowRight,
    faPaperPlane,
    faEnvelope as faEnvelopeSolid,
    faFileLines as faFileLinesSolid
} from '@fortawesome/free-solid-svg-icons';
import { 
    faEnvelope, 
    faFileLines 
} from '@fortawesome/free-regular-svg-icons';
import { 
    faGithub, 
    faLinkedin, 
    faLinkedinIn 
} from '@fortawesome/free-brands-svg-icons';

library.add(
    faEnvelopeSolid,
    faFileLinesSolid,
    faEnvelope,
    faFileLines,
    faMoon,
    faSun,
    faCircleHalfStroke,
    faCode,
    faPen,
    faBriefcase,
    faChevronLeft,
    faChevronRight,
    faGrip,
    faGithub,
    faLinkedin,
    faLinkedinIn,
    faDiagramProject,
    faUser,
    faHouse,
    faUserGraduate,
    faCertificate,
    faBuilding,
    faFlask,
    faXmark,
    faArrowRight,
    faPaperPlane
);
dom.watch();