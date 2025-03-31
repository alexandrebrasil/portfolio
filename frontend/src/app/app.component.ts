import { Component } from '@angular/core';
import { MatIconAnchor } from '@angular/material/button';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [MatIconAnchor, RouterLink, MatTooltip, MatIcon, RouterOutlet]
})
export class AppComponent {
  title = 'portfolio';
}
