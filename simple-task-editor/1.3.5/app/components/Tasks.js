import React from 'react';
import TasksManager from '../lib/tasksManager';
import TaskRow from './TaskRow';
import Task from '../models/Task';
import CreateTask from './CreateTask';
import Sortable from 'sortablejs';

export default class Tasks extends React.Component {

  constructor(props) {
    super(props);
    this.state = {unsavedTask: '', openTasks: [], completedTasks: []};
    TasksManager.get().setDataChangeHandler((tasks) => {
      // We need TasksManager.get().isMobile() to be defined, and this handler is called once on bridge ready.
      this.initiateSorting();
      this.updateTasks();
    })

    TasksManager.get().setOnReady(() => {
      let platform = TasksManager.get().getPlatform();
      // add platform class to main <html> element
      var root = document.documentElement;
      root.className += platform;
      this.setState({ready: true})
    })
  }

  componentDidMount() {
    TasksManager.get().initiateBridge();
    this.updateTasks();
  }

  initiateSorting() {
    if(this.didInitiateSorting) {
      return;
    }
    this.didInitiateSorting = true;

    let properties = {
      delay: 100, // time in milliseconds to define when the sorting should start
      delayOnTouchOnly: true, // only delay if user is using touch
      draggable: '.task',
      dragClass: 'task-dragging',
      handle: '.checkbox-container',
      onEnd: this.taskCompletedDragging
    };

    properties['name'] = 'open-tasks';
    Sortable.create(document.getElementById('open-tasks'), properties);

    properties['name'] = 'completed-tasks';
    Sortable.create(document.getElementById('completed-tasks'), properties);
  }

  updateTasks() {
    this.setState(TasksManager.get().splitTasks());
  }

  deleteTask = (task) => {
    TasksManager.get().deleteTask(task);
    this.updateTasks();
  }

  toggleTaskStatus = (task) => {
    task.toggleStatus();
    if(!task.completed) {
      TasksManager.get().moveTaskToTop(task);
    }

    setTimeout(() => {
      // Allow UI to show checkmark before transferring to other list
      this.taskStatusUpdated();
    }, 300);
  }

  handleTaskTextChange = (task) => {
    TasksManager.get().save();
  }

  taskStatusUpdated() {
    this.updateTasks();
    TasksManager.get().save();
  }

  taskAtIndex(list, relativeIndex) {
    if(list == 0) {
      return this.state.openTasks[relativeIndex];
    } else {
      return this.state.completedTasks[relativeIndex];
    }
  }

  taskCompletedDragging = (evt) => {
    let isSourceOpen =  evt.from.id == 'open-tasks';
    let isSourceCompleted =  evt.from.id == 'completed-tasks';
    let isDestinationCompleted = evt.to.id == 'completed-tasks';
    let isDestinationOpen = !isDestinationCompleted;
    let fromIndex = evt.oldIndex;
    let toIndex = evt.newIndex;

    var fromTask = this.taskAtIndex(isSourceOpen ? 0 : 1, fromIndex);
    var toTask = this.taskAtIndex(isDestinationOpen ? 0 : 1, toIndex);

    TasksManager.get().changeTaskPosition(fromTask, toTask);
    if(isDestinationCompleted) {
      fromTask.markCompleted();
    } else {
      fromTask.markOpen();
    }

    this.taskStatusUpdated();
  }

  createTask = (rawString) => {
    TasksManager.get().setUnsavedTask('');
    let task = TasksManager.get().createTask(rawString);
    TasksManager.get().addTask(task);
    this.updateTasks();
  }

  saveUnsavedTask = (rawString) => {
    // save current entry to task list that has not been officially saved by pressing 'enter' yet
    TasksManager.get().setUnsavedTask(rawString);
    TasksManager.get().save();
    this.updateTasks();
  }

  onReopenCompleted = () => {
    if(confirm("Are you sure you want to reopen completed tasks?")) {
      TasksManager.get().reopenCompleted();
      this.updateTasks();
    }
  }

  onDeleteCompleted = () => {
    if(confirm("Are you sure you want to delete completed tasks?")) {
      TasksManager.get().deleteCompleted();
      this.updateTasks();
    }
  }

  taskRowForTask(task, index) {
    return (
      <TaskRow
        task={task}
        handleCheckboxChange={this.toggleTaskStatus}
        handleTextChange={this.handleTaskTextChange}
        deleteTask={this.deleteTask}
        key={TasksManager.get().keyForTask(task)}
      />
    )
  }

  render() {
    let {unsavedTask, openTasks, completedTasks} = this.state;

    return (
      <div>

        {this.state.ready &&
          <div>
            <CreateTask onSubmit={this.createTask} onUpdate={this.saveUnsavedTask} unsavedTask={unsavedTask} />
          </div>
        }

        <div className='task-section'>
          <h3>Open Tasks</h3>
          <div id="open-tasks">
            {openTasks.map((task, index) => {
              return this.taskRowForTask(task, index);
            })}
          </div>
        </div>

        <div className='task-section'>
          <h3>Completed Tasks</h3>
          <div id="completed-tasks">
            {completedTasks.map((task, index) => {
              return this.taskRowForTask(task, index);
            })}
          </div>

          {completedTasks.length > 0 &&
            <div>
              <a className="clear-button" onClick={this.onReopenCompleted}>Reopen Completed</a>
              <a className="clear-button" onClick={this.onDeleteCompleted}>Delete Completed</a>
            </div>
          }
        </div>

      </div>
    )
  }

}
