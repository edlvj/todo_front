import { Component, ViewEncapsulation, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Project, Task } from '../../_models';
import { first } from 'rxjs/operators';

import { TaskService } from '../../_services';

@Component({
  selector: 'tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.sass'],
  encapsulation: ViewEncapsulation.None
})

export class TasksComponent implements OnInit {
  @Input() project: Project;
  @Input() included: Array<Task>;

  tasks: Task[];
  
  ngOnInit() {
    let relationships = this.project.relationships.tasks.data;
    this.tasks = this.filterRelations(relationships, this.included);
  }

  constructor(
    private taskService: TaskService
  ) {}

  filterRelations(relations, included) {
      var filtered = [];

      for (let i = 0; i < relations.length; i++) {
        for (let j = 0; j < included.length; j++) {
          if((relations[i].id === included[j].id) && (relations[i].type === included[j].type)) {
            filtered.push(included[j]);
          } 
        }
      }
      
      return filtered;
  }

  create(title: string) {
      this.taskService.create(this.project, title)
      .pipe(first())
      .subscribe(
          task => {
              this.tasks.push(task.data);
          },
          errors => {
              console.log(errors);
          });
  }

  delete(task: Task) {
      this.taskService.delete(this.project, task).pipe(first()).subscribe(t => {
          let index = this.tasks.indexOf(task);
          this.tasks.splice(index, 1);
      });
  }

  updateTitle(task: Task) {
      this.taskService.update(this.project, task, { title: task.attributes.title }).pipe(first()).subscribe(t => {
          let index = this.tasks.indexOf(task);
          this.tasks[index].attributes.title = task.attributes.title;  
          task.editable = false;
      });
  }

  updateDeadline(task: Task) {
      this.taskService.update(this.project, task, { deadline: task.attributes.deadline}).pipe(first()).subscribe(t => {
          let index = this.tasks.indexOf(task);
          this.tasks[index].attributes.deadline = task.attributes.deadline;
      });
  }

  updateStatus(task: Task) {
      this.taskService.update(this.project, task, { done: task.attributes.done }).pipe(first()).subscribe(t => {
          let index = this.tasks.indexOf(task);
          this.tasks[index].attributes.done = task.attributes.done;
      });
  }

  move(options: object) {
    console.log(options['index']);
    let temp = this.tasks[options['new_index']];
    if(typeof temp ==='undefined') {
      return;
    };

    this.tasks[options['new_index']] = this.tasks[options['index']];
    this.tasks[options['index']] = temp;

    this.taskService.update(this.project, options['task'], { priority: options['new_index'], move_type: options['type'] }).pipe(first()).subscribe(t => {
        console.log(t);
       // this.tasks[options['new_index']].attributes.priority = t.attributes.priority;
    });
  }

  private commentsCount(task: Task){}

  private onCompleteMessage(){ }
  
  private sortTasks(task: Task, index: number, action: String){ }
}
