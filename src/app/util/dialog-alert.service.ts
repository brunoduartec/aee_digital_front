import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
  })
  export class DialogAlertService {
    constructor(
      private matSnackBar: MatSnackBar
    ) { }
  
    openDialog(
      mensagem: string, tipo: string, duracao: number = 5,
      horizontal: MatSnackBarHorizontalPosition = 'right',
      vertical: MatSnackBarVerticalPosition = 'top'): void {
      this.matSnackBar.open(mensagem, '✖', {
        duration: duracao * 1000,
        horizontalPosition: horizontal,
        panelClass: [tipo],
        verticalPosition: vertical
      });
    }
  }