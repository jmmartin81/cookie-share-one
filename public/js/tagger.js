$(document).ready(function () {

    var tags = [];

    function loadForm() {
        if($('#tags').val()){
            var arrayTags = $('#tags').val().split(',');
            tags = [];
            _.each(arrayTags, (tag) => {
                var res = tag.split(':');
                tags.push({ key: res[0], value: res[1], deleted: false });
            });
            $('#tags').val(JSON.stringify(tags));
        }
    }

    function updateForm() {
        var arrayTags = [];
        _.each(tags, (tag) => {
            arrayTags.push({ key: tag.key, value: tag.value, deleted: tag.deleted });
        });
        $('#tags').val(JSON.stringify(arrayTags));
    }

    var $taggerContainer = $('#taggerContainer');
    var $tagTemplate = Handlebars.compile($('#tag-template-dynamic').html());

    function addTag(id, enable, key, value) {
        var tagHtml = $tagTemplate({ id: id, enable: enable });
        $taggerContainer.append(tagHtml);
        if (enable) {
            $('#autocompleteKeys' + id).autocomplete({ 
                source: function( request, response ) {
                    $.ajax({
                        url: '/api/tagger/keys',
                        method: 'post',
                        data: JSON.stringify({ prefix: request.term }),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (data) {
                            response( data );
                        }
                    });
                }
            });

            $('#autocompleteValues' + id).autocomplete({ 
                source: function( request, response ) {
                    $.ajax({
                        url: '/api/tagger/values',
                        method: 'post',
                        data: JSON.stringify({ key: $('#autocompleteKeys' + id).val(), prefix: request.term }),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (data) {
                            response( data );
                        }
                    });
               }
            });

            $('#autocompleteKeys' + id).keyup(function (e) {
                var prefix = $(this).val();
                tags[id].key = prefix;
                updateForm();
            });
            $('#autocompleteKeys' + id).change(function (e) {
                var prefix = $(this).val();
                tags[id].key = prefix;
                updateForm();
            });
            $('#autocompleteValues' + id).keyup(function (e) {
                var prefix = $(this).val();
                tags[id].value = prefix;
                updateForm();
            });
            $('#autocompleteValues' + id).change(function (e) {
                var prefix = $(this).val();
                tags[id].value = prefix;
                updateForm();
            });
        } else {
            $('#autocompleteKeys' + id).val(key);
            $('#autocompleteKeys' + id).prop('disabled', true);
            $('#autocompleteValues' + id).val(value);
            $('#autocompleteValues' + id).prop('disabled', true);
        }

        $('#btDeleteTag' + id).click(function (e) {
            e.preventDefault();
            tags[id].deleted = true;
            updateForm();
            loadTags();
        });
    }

    function loadTags() {
        _.each(tags, (tag, i) => {
            $('#tagContainer' + i).remove();
            if (!tag.deleted) {
                addTag(i, false, tag.key, tag.value);
            }
        });
    }
    loadForm();
    loadTags();

    $('#btNewTag').click(function (e) {
        e.preventDefault();
        loadTags();
        tags.push({ key: '', value: '', deleted: false });
        addTag(tags.length - 1, true, '', '');
    });

});
