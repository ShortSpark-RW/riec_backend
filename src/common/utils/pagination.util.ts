import { PaginationDto } from '../dto/pagination.dto';

export function getPagination(pagination: PaginationDto) {
  const page = pagination.page ?? 1;
  const pageSize = pagination.pageSize ?? 20;
  const take = pageSize;
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip, take };
}


