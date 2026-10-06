class InstructorMaterial {
  const InstructorMaterial({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.duration,
    required this.order,
  });
  final String id, title, type;
  final String? description;
  final int? duration;
  final int order;
}

class InstructorMaterialMedia {
  const InstructorMaterialMedia({
    required this.url,
    required this.contentType,
    required this.mimeType,
    required this.referer,
  });
  final String url, contentType;
  final String? mimeType, referer;
}

/// A file picked on the device, streamed to the server on upload.
class MaterialUploadFile {
  const MaterialUploadFile({
    required this.name,
    required this.length,
    required this.mimeType,
    required this.openRead,
  });
  final String name, mimeType;
  final int length;
  final Stream<List<int>> Function() openRead;
}
