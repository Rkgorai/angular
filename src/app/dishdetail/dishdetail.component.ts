import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Dish } from '../shared/dish';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment, CommentType } from '../shared/comment';
import { from } from 'rxjs';



@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})

// @Input(commentForm.rating)
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm: FormGroup;
  comment: Comment;
  commentType = CommentType;
  @ViewChild('fform') commentFormDirective;
  @Input('commentForm.rating') value : number;

  formErrors = {
    'author': '',
    'comment':''
  };

  validationMessages = {
    'author':{
      'required':      'Author Name is required.',
      'minlength':     'Author Name must be at least 2 characters long.',
    },
    'comment':{
      'required':      'Comment is required.',
    }

    
  }

  constructor(private dishService: DishService, 
    private route: ActivatedRoute,
    private location: Location,
    private cm: FormBuilder) {
      this.createForm();
     }

  ngOnInit():void {
    this.dishService.getDishIds()
     .subscribe((dishIds) => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
    .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });

  }

  createForm(){
    this.commentForm = this.cm.group({
      rating: 5,
      comment:['', [Validators.required]],
      author:['', [Validators.required, Validators.minLength(2)] ]

    });
    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // reset form validation message

  }



  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    console.log(this.comment);

    // push new comment to dish comment array
    let date = new Date();
    this.dish.comments.push({
      rating: this.comment.rating,
      comment: this.comment.comment,
      author: this.comment.author,
      date: date.toISOString()
    });
    
    this.commentForm.reset({
      author: '',
      comment: '',
      rating: 5
    }
    );
    this.commentFormDirective.resetForm();
  }

}
