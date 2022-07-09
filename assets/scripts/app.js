const addProjectModal = document.getElementById('p3');
const addProjectButton = document.getElementById('add');
const backdrop = document.getElementById('backdrop');
const entryTextSection = document.getElementById('active-list')
const userInputs = addProjectModal.querySelectorAll('input');

class DOMHelper {
    static clearEventListeners(element) {
        const clonedElement = element.cloneNode(true);
        element.replaceWith(clonedElement);
        return clonedElement;
    }

    static moveElement(elementId, newDestinationSelector) {
        const element = document.getElementById(elementId);
        const destinationElement = document.querySelector(newDestinationSelector);
        destinationElement.append(element);
        element.scrollIntoView({behavior: 'smooth'});
    }
}

class Component {
    constructor(hostElementId, insertBefore = false) {
        if(hostElementId) {
            this.hostElement = document.getElementById(hostElementId);
        } else {
            this.hostElement = document.body;
        }
        this.insertBefore = insertBefore;
    }

    detach() {
        if(this.element) {
            this.element.remove();
        }
    }

    attach() {
        this.hostElement.insertAdjacentElement(this.insertBefore ? 'afterbegin' : 'beforeend', this.element);
    }
}

class Tooltip extends Component {
    constructor(closeNotifierFunction, text, hostElementId) {
        super(hostElementId);
        this.closeNotifier = closeNotifierFunction;
        this.text = text;
        this.create();
    }

    closeTooltip = () => {
        this.detach();
        this.closeNotifier();
    }

    create() {
        const tooltipElement = document.createElement('div');
        tooltipElement.className = 'card';

        const tooltipTemplate = document.getElementById('tooltip');
        const tooltipBody = document.importNode(tooltipTemplate.content, true);
        tooltipBody.querySelector('p').textContent = this.text;
        tooltipElement.append(tooltipBody);
        const hostElPosLeft = this.hostElement.offsetLeft;
        const hostElPosTop = this.hostElement.offsetTop;
        const hostElHeight = this.hostElement.clientHeight;
        const parentElementScrolling = this.hostElement.parentElement.scrollTop;

        const x = hostElPosLeft + 20;
        const y = hostElPosTop + hostElHeight - parentElementScrolling - 10;

        tooltipElement.style.position = 'absolute';
        tooltipElement.style.left = x + 'px'; // 500
        tooltipElement.style.top = y + 'px';

        tooltipElement.addEventListener('click', this.closeTooltip);
        this.element = tooltipElement;
    }
}

class ProjectItem {
    hasActiveTooltip = false;

    constructor(id, updateProjectListsFunction, type) {
        this.id = id;
        this.updateProjectListsHandler = updateProjectListsFunction;
        this.connectMoreInfoButton();
        this.connectSwitchButton(type);
    }

    showMoreInfoHandler() {
        if(this.hasActiveTooltip) {
            return;
        }

        const projectElement = document.getElementById(this.id);
        const tooltipText = projectElement.dataset.extraInfo;
        
        const tooltip = new Tooltip(() => {
            this.hasActiveTooltip = false;
        }, tooltipText, this.id);
        tooltip.attach();
        this.hasActiveTooltip = true;
    }

    connectMoreInfoButton() {
        const projectItemElement = document.getElementById(this.id);
        const moreInfoButton = projectItemElement.querySelector('button:first-of-type');
        moreInfoButton.addEventListener('click', this.showMoreInfoHandler.bind(this));
    }

    connectSwitchButton(type) {
        const projectItemElement = document.getElementById(this.id);
        let switchButton = projectItemElement.querySelector('button:last-of-type');
        switchButton = DOMHelper.clearEventListeners(switchButton);
        switchButton.textContent = type = 'Activate' ? 'Finish' : 'Activate';
        switchButton.addEventListener('click', this.updateProjectListsHandler.bind(null, this.id));
    }

    update(updateProjectListsFunction, type) {
        this.updateProjectListsHandler = updateProjectListsFunction;
        this.connectSwitchButton(type);
    }
}

class ProjectList {
    projects = [];

    constructor(type) {
        this.type = type;
        const projectItems = document.querySelectorAll(`#${type}-projects li`); // gives you a NodeList
        for(const projectItem of projectItems) {
            this.projects.push(new ProjectItem(projectItem.id, this.switchProject.bind(this), this.type));
        }
        // console.log(this.projects);
    }

    setSwitchHandlerFunction(switchHandlerFunction) {
        this.switchHandlerFunction = switchHandlerFunction;
    }

    addProject(project) {
        this.projects.push(project);
        DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);
        project.update(this.switchProject.bind(this), this.type);
    }

    switchProject(projectId) {
        // const projectIndex = this.projects.findIndex(p => p.id === projectId);
        // this.projects.splice();
        this.switchHandlerFunction(this.projects.find(p => p.id === projectId));
        this.projects = this.projects.filter(p => p.id !== projectId); // filter values that are equal to projectId; drop when found false
    }

    updateUI() {
        if(projects.length === 0) {
            entryTextSection.style.display = 'block';
        } else {
            entryTextSection.style.display = 'none';
        }
    }

    renderNewProjectElement(title, description, data) {
        const newProjectElement = document.createElement('li');
        newProjectElement.innerHTML = `
        <li
            id="p${projects.length++}"
            data-extra-info="${data}"
            class="card"
        >
            <h2>${title}</h2>
            <p>${description}</p>
            <button class="alt">More Info</button>
            <button>Finish</button>
        </li>
        `;
        newProjectElement.addEventListener(
            'click',

        );
        const listRoot = document.getElementById('') // TODO: continue this part referenced on line 84 of dom-14-finished
    }
    
    addProjectHandler() {
        const titleValue = userInputs[0].value;
        const descriptionValue = userInputs[1].value;
        const dataValue = userInputs[2].value;
    
        if(
            titleValue.trim === '' ||
            descriptionValue.trim === '' ||
            dataValue.trim === ''
        ) {
            alert("Please do not leave any blank values!");
            return;
        }
    
        const newProject = {
            title: titleValue,
            description: descriptionValue,
        };
    
        projects.push(newProject);
        console.log(projects);
        toggleBackdrop();
        renderNewProjectElement(
            newProject.title,
            newProject.description,
        );
        updateUI();
    }
}

class App {
    static init() {
        const activeProjectsList = new ProjectList('active');
        const finishedProjectsList = new ProjectList('finished');
        activeProjectsList.setSwitchHandlerFunction(finishedProjectsList.addProject.bind(finishedProjectsList));
        finishedProjectsList.setSwitchHandlerFunction(activeProjectsList.addProject.bind(activeProjectsList));
    }
}

const showProjectModal = () => {
    addProjectModal.classList.add('visible');
    toggleBackdrop();
}

const toggleBackdrop = () => {
    backdrop.classList.toggle('visible');
}

App.init();

addProjectButton.addEventListener('click', showProjectModal);
backdrop.addEventListener('click', toggleBackdrop);