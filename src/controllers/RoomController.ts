import { JsonController } from 'routing-controllers';
import { Logger } from '../decorators/Logger';
import { ILogger } from '../interfaces/ILogger';

@JsonController()
export class RoomController {

  constructor(
    @Logger() private readonly logger: ILogger
  ) { }
}